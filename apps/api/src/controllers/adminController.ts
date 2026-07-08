import type { Request, Response, NextFunction } from "express";
import formidable from "formidable";
import cloudinary from "../cloudinary/cloudinary";
import { pool } from "../db";
import {
  productVariationServerSchema,
  productSchema,
} from "@ecom/shared/src/parseFormidableSchema";

const parseVariations = (fields: formidable.Fields) => {
  const variations: Record<string, string>[] = [];

  for (const [key, value] of Object.entries(fields)) {
    const match = key.match(/^variations\[(\d+)\]\[(\w+)\]$/);
    if (!match) continue;

    const index = parseInt(match[1]);
    const field = match[2];

    if (!variations[index]) variations[index] = {};
    variations[index][field] = value?.[0] ?? "";
  }

  return variations;
};

const parseProduct = (files: formidable.Files, fields: formidable.Fields) => {
  const parsedVariations = parseVariations(fields);

  const name = fields.name?.[0];
  const price = parseFloat(fields.price?.[0] ?? "0");
  const type = fields.type?.[0];
  const push_home_page = fields.push_home_page?.[0] === 'true' ? true : false;
  const release_date = fields.release_date?.[0];
  console.log(fields);
  const discount_percentage = parseFloat(
    fields.discount_percentage?.[0] ?? "0",
  );

  const variations = [];
  let totalStock = 0;
  for (const [index, variation] of parsedVariations.entries()) {
    const label = variation.label;
    const variation_id = variation.variation_id;
    const is_cover = variation.is_cover === "true";
    const stock = parseInt(variation.stock);
    const price_offset = parseFloat(variation.price_offset);
    totalStock += stock;
    const image = files[`variations[${index}]`]?.at(0);
    const image_url = variation.image_url;

    variations.push({
      label,
      variation_id,
      image,
      image_url,
      is_cover,
      stock,
      price_offset,
    });
  }

  return {
    name,
    price,
    type,
    release_date,
    push_home_page,
    discount_percentage,
    variations,
    is_sold_out: totalStock <= 0,
  };
};

export const addProduct = async (req: Request, res: Response) => {
  const uploadedImages: string[] = [];
  const client = await pool.connect();
  try {
    const form = formidable({ keepExtensions: true });
    const [fields, files] = await form.parse(req);

    const product = parseProduct(files, fields);
    //console.log("---------------------Product Object------------------");
    //console.log(product);

    // validation first
    const validationResult = productSchema.safeParse(product);
    //console.log("---------------------Validation Result------------------");
    // console.log(validationResult);
    if (!validationResult.success) {
      const errors = validationResult.error.issues; // array of ZodError objects
      errors.forEach((err) => {
        console.log(err.path, err.message); // ["name"], "Name is required"
      });
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }

    const { name, price, release_date, type, discount_percentage, push_home_page, variations } =
      validationResult.data;
    const { is_sold_out } = product;
    //after validation, lets start uploading images first
    const finalVariationResults = await Promise.all(
      variations.map(async (variation) => {
        if (variation.image) {
          const result = await cloudinary.uploader.upload(
            variation.image.filepath,
            {
              folder: "RedfieldGaming",
            },
          );
          uploadedImages.push(result.public_id);

          return {
            image_url: result.secure_url,
            image_public_id: result.public_id,
            label: variation.label,
            stock: variation.stock,
            price_offset: variation.price_offset,
            is_cover: variation.is_cover,
          };
        }
        throw new Error(`Variation "${variation.label}" is missing an image`);
      }),
    );

    const coverImageVariation = finalVariationResults.find((v) => v.is_cover);

    const coverImageUrl =
      coverImageVariation?.image_url || finalVariationResults[0]?.image_url;

    await client.query("BEGIN");

    const productInsertResult = await client.query(
      `INSERT INTO products (name, cover_image_url, price, type, release_date, push_home_page,is_sold_out , discount_percentage)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING product_id`,
      [
        name,
        coverImageUrl,
        price,
        type,
        release_date,
        push_home_page,
        is_sold_out,
        discount_percentage,
      ],
    );

    const productId = productInsertResult.rows[0].product_id;

    await Promise.all(
      finalVariationResults.map(
        async (variation) =>
          await client.query(
            `INSERT INTO product_variations (product_id, label, image_url, image_public_Id, stock, price_offset)
       VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              productId,
              variation.label,
              variation.image_url,
              variation.image_public_id,
              variation.stock,
              variation.price_offset,
            ],
          ),
      ),
    );
    console.timeEnd("PG finish insert product variation");

    await client.query("COMMIT");

    res.status(200).json({ message: "Add product Success" });
  } catch (e) {
    //undo everything if any error occur
    await client.query("ROLLBACK");

    //clean up image if any error happen
    if (uploadedImages.length > 0) {
      await cloudinary.api.delete_resources(uploadedImages);
      console.log("Cleaned up images:", uploadedImages);
    }

    console.log(e);
    res.status(500).json({ error: "Invalid action" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const uploadedImages: string[] = [];
  const imagesToDelete: string[] = [];
  const client = await pool.connect();

  try {
    const form = formidable({ keepExtensions: true });
    const [fields, files] = await form.parse(req);
    const { id } = req.params;
    const product_id = parseInt(id as string);

    const product = parseProduct(files, fields);

    const validationResult = productSchema.safeParse(product);
    console.log(product);
    if (!validationResult.success) {
      const errors = validationResult.error.issues;
      errors.forEach((err) => console.log(err.path, err.message));
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors });
    }

    const {
      name,
      price,
      release_date,
      type,
      push_home_page,
      discount_percentage,
      variations: newVariations,
    } = validationResult.data;
    const { is_sold_out } = product;

    // Check product exists
    const productCheck = await pool.query(
      "SELECT product_id FROM products WHERE product_id = $1",
      [product_id],
    );
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Fetch existing variations
    const existingVariations = (
      await pool.query(
        "SELECT * FROM product_variations WHERE product_id = $1",
        [product_id],
      )
    ).rows;

    // Upload new images first
    const finalVariations = await Promise.all(
      newVariations.map(async (variation) => {
        if (variation.image) {
          const result = await cloudinary.uploader.upload(
            variation.image.filepath,
            {
              folder: "RedfieldGaming",
            },
          );
          uploadedImages.push(result.public_id);
          return {
            ...variation,
            image_url: result.secure_url,
            image_public_id: result.public_id,
          };
        }

        // No new image — get existing image data from DB
        const oldData = existingVariations.find(
          (old) => old.variation_id === variation.variation_id,
        );
        if (!oldData) {
          throw new Error(
            `Variation ${variation.variation_id} not found in DB but has no new image`,
          );
        }
        return {
          ...variation,
          image_url: oldData.image_url,
          image_public_id: oldData.image_public_id,
        };
      }),
    );

    const coverVariation = finalVariations.find((v) => v.is_cover);
    const coverImageUrl =
      coverVariation?.image_url ?? finalVariations[0]?.image_url;

    // Determine which existing variations were removed
    // basically filter out all the variations with invalid variation_id
    const incomingVariationIds = new Set(
      finalVariations.map((v) => v.variation_id).filter(Boolean),
    );

    // get the variations that should remove, which mean didnt exist in newVariation
    const removedVariations = existingVariations.filter(
      (old) => !incomingVariationIds.has(old.variation_id),
    );

    // DB transaction start
    await client.query("BEGIN");

    // Update product
    await client.query(
      `UPDATE products
       SET name=$1, cover_image_url=$2, price=$3, type=$4,
           release_date=$5, push_home_page=$6, is_sold_out=$7, discount_percentage=$8, updated_at=NOW()
       WHERE product_id=$9`,
      [
        name,
        coverImageUrl,
        price,
        type,
        release_date,
        push_home_page,
        is_sold_out,
        discount_percentage,
        product_id,
      ],
    );

    // Delete removed variations from DB
    // Any mean where variation match in any value in the array
    if (removedVariations.length > 0) {
      await client.query(
        "DELETE FROM product_variations WHERE variation_id = ANY($1)",
        [removedVariations.map((v) => v.variation_id)],
      );
      removedVariations.forEach((v) => {
        if (v.image_public_id) imagesToDelete.push(v.image_public_id);
      });
    }

    // Update existing / insert new variations
    await Promise.all(
      finalVariations.map((variation) => {
        if (variation.variation_id) {
          // Check if image changed — queue old image for deletion
          const oldData = existingVariations.find(
            (old) => old.variation_id === variation.variation_id,
          );
          if (
            oldData &&
            oldData.image_public_id !== variation.image_public_id
          ) {
            imagesToDelete.push(oldData.image_public_id);
          }

          return client.query(
            `UPDATE product_variations
             SET label=$1, image_url=$2, image_public_id=$3,
                 stock=$4, price_offset=$5, updated_at=NOW()
             WHERE variation_id=$6`,
            [
              variation.label,
              variation.image_url,
              variation.image_public_id,
              variation.stock,
              variation.price_offset,
              variation.variation_id,
            ],
          );
        }

        // No variation_id — it's a new variation, insert it
        return client.query(
          `INSERT INTO product_variations
           (product_id, label, image_url, image_public_id, stock, price_offset)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            product_id,
            variation.label,
            variation.image_url,
            variation.image_public_id,
            variation.stock,
            variation.price_offset,
          ],
        );
      }),
    );

    await client.query("COMMIT");

    // 6. Send response, then clean up old Cloudinary images after
    res.status(200).json({ message: "Update product Success" });

    if (imagesToDelete.length > 0) {
      try {
        await Promise.all(
          imagesToDelete
            .filter(Boolean)
            .map((id) => cloudinary.uploader.destroy(id)),
        );
      } catch (cloudErr) {
        console.error("Cloudinary cleanup failed:", cloudErr);
      }
    }
  } catch (e) {
    await client.query("ROLLBACK");

    // Clean up any newly uploaded images if something failed
    if (uploadedImages.length > 0) {
      try {
        await cloudinary.api.delete_resources(uploadedImages);
        console.log("Cleaned up uploaded images after error:", uploadedImages);
      } catch (cloudErr) {
        console.error("Cloudinary error cleanup failed:", cloudErr);
      }
    }

    console.error(e);
    res.status(500).json({ error: "Update failed" });
  } finally {
    client.release(); // always release, even if an error is thrown
  }
};



// single product


// single product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product_id = parseInt(String(id));

    const variationsResult = await pool.query(
      "SELECT * FROM product_variations WHERE product_id = $1 ORDER BY created_at ASC",
      [product_id],
    );

    await pool.query("DELETE FROM products WHERE product_id = $1", [
      product_id,
    ]);

    // Then clean up images — don't block the response
    try {
      await Promise.all(
        variationsResult.rows.map((data) =>
          cloudinary.uploader.destroy(data.image_public_id),
        ),
      );
    } catch (cloudErr) {
      console.error("Cloudinary cleanup failed:", cloudErr);
    }

    res.json({ message: "Product deleted" });
  } catch (e) {
    res.status(500).json({ error: "Delete failed" });
  }
};

// Multiple product
export const deleteProducts = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const product_id = parseInt(String(id));

    const variationsResult = await pool.query(
      "SELECT * FROM product_variations WHERE product_id = $1 ORDER BY created_at ASC",
      [product_id],
    );

    await pool.query("DELETE FROM products WHERE product_id = $1", [
      product_id,
    ]);

    // Then clean up images — don't block the response
    try {
      await Promise.all(
        variationsResult.rows.map((data) =>
          cloudinary.uploader.destroy(data.image_public_id),
        ),
      );
    } catch (cloudErr) {
      console.error("Cloudinary cleanup failed:", cloudErr);
    }

    res.json({ message: "Product deleted" });
  } catch (e) {
    res.status(500).json({ error: "Delete failed" });
  }
};

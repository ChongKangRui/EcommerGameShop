import type { Request, Response, NextFunction } from "express";
import formidable from "formidable";
import cloudinary from "../cloudinary/cloudinary";
import { pool } from "../db";
import {
  productVariationServerSchema,
  productSchema,
} from "@ecom/shared/src/parseFormidableSchema";

const parseVariations =  (fields: formidable.Fields) => {
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
  const release_date = fields.release_date?.[0];

  const discount_percentage = parseFloat(
    fields.discount_percentage?.[0] ?? "0",
  );

  const variations = [];
  let totalStock = 0;
  for (const [index, variation] of parsedVariations.entries()) {
    const label = variation.label;
    const is_cover = variation.is_cover === "true";
    const stock = parseInt(variation.stock);
    const price_offset = parseFloat(variation.price_offset);
    totalStock += stock;
    const image = files[`variations[${index}]`]?.at(0);

    variations.push({ label, image, is_cover, stock, price_offset });
  }

  return {
    name,
    price,
    type,
    release_date,
    discount_percentage,
    variations,
    is_sold_out: totalStock <= 0,
  };
};

export const addProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const uploadedImages: string[] = [];
    const client = await pool.connect();
  try {
    const form = formidable({ keepExtensions: true });
    const [fields, files] = await form.parse(req);

    console.log("Cloudinary config check:", {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_CLOUD_KEY ? "exists" : "MISSING",
      api_secret: process.env.CLOUDINARY_CLOUD_SECRET ? "exists" : "MISSING",
    });
    // insert variation main info
    // const variations = parseVariations(fields);

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

    const { name, price, release_date, type, discount_percentage, variations } =
      validationResult.data;
    const { is_sold_out } = product;
    //after validation, lets start uploading images first
    const imageUploads = await Promise.all(
      variations.map(async (variation) => {
        const result = await cloudinary.uploader.upload(
          variation.image.filepath,
          {
            folder:"RedfieldGaming"
          }
        );
        uploadedImages.push(result.public_id);
        return {
          imageUrl: result.secure_url,
          image_public_id: result.public_id,
          label: variation.label,
          stock: variation.stock,
          price_offset: variation.price_offset,
          is_cover: variation.is_cover,
        };
      }),
    );

    console.timeEnd("cloudinary finished upload");

    const coverImageVariation = imageUploads.find((v) => v.is_cover);
    
    const coverImageUrl =
      coverImageVariation?.imageUrl || imageUploads[0]?.imageUrl;

    await client.query("BEGIN");
     console.timeEnd("PG begin insert");
    const productInsertResult = await client.query(
      `INSERT INTO products (name, cover_image_url, price, type, release_date,is_sold_out , discount_percentage)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING product_id`,
      [
        name,
        coverImageUrl,
        price,
        type,
        release_date,
        is_sold_out,
        discount_percentage,
      ],
    );
     console.timeEnd("PG finish insert product");
    const productId = productInsertResult.rows[0].product_id;
    console.log(productInsertResult);
    await Promise.all(
      imageUploads.map((variation) =>
        client.query(
          `INSERT INTO product_variations (product_id, label, image_url, image_public_Id, stock, price_offset)
       VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            productId,
            variation.label,
            variation.imageUrl,
            variation.image_public_id ,
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

import formidable from "formidable";
import { logger } from "src/utils/loggerHelper";

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

export const parseProductForm = (
  files: formidable.Files,
  fields: formidable.Fields,
) => {
  const parsedVariations = parseVariations(fields);
  
  const name = fields.name?.[0];
  const price = parseFloat(fields.price?.[0] ?? "0");
  const type = fields.type?.[0];
  const push_home_page = fields.push_home_page?.[0] === "true";
  
  const release_date = fields.release_date?.[0];
  const is_active = fields.is_active?.[0] === "true";
  const description = fields.description?.[0];
  const discount_percentage = parseFloat(fields.discount_percentage?.[0] ?? "0");

  const variations = [];
  for (const [index, variation] of parsedVariations.entries()) {
    variations.push({
      label: variation.label,
      variation_id: variation.variation_id,
      image: files[`variations[${index}]`]?.at(0),
      image_url: variation.image_url,
      is_cover: variation.is_cover === "true",
      stock: parseInt(variation.stock),
      price_offset: parseFloat(variation.price_offset),
    });
  }

  logger.debug(`Parsed product "${name}" with ${variations.length} variations`);

  return {
    name, price, type, release_date, push_home_page, is_active,
    discount_percentage, description, variations,
  };
};
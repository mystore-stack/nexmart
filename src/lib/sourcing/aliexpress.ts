import { ExternalProduct, SourcingProvider } from "./types";
import crypto from "crypto";

export class AliExpressProvider implements SourcingProvider {
  name = "ALIEXPRESS";

  private generateSign(params: Record<string, string>, appSecret: string): string {
    const sortedKeys = Object.keys(params).sort();
    let str = appSecret;
    for (const key of sortedKeys) {
      str += key + params[key];
    }
    str += appSecret;
    return crypto.createHash("md5").update(str, "utf8").digest("hex").toUpperCase();
  }

  async fetchProduct(urlOrId: string): Promise<ExternalProduct | null> {
    const appKey = process.env.ALIEXPRESS_APP_KEY;
    const appSecret = process.env.ALIEXPRESS_APP_SECRET;
    const accessToken = process.env.ALIEXPRESS_ACCESS_TOKEN;

    if (!appKey || !appSecret || !accessToken) {
      throw new Error("AliExpress API is not configured (missing credentials).");
    }

    const productIdMatch = urlOrId.match(/(?:item\/|product\/|^)(\d+)(?:\.html)?/i);
    const productId = productIdMatch ? productIdMatch[1] : urlOrId.replace(/\D/g, "");

    if (!productId || productId.length < 5) {
      throw new Error("Invalid AliExpress Product ID or URL");
    }

    const method = "aliexpress.ds.product.get";
    
    // Format timestamp: yyyy-MM-dd HH:mm:ss
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const params: Record<string, string> = {
      method,
      app_key: appKey,
      session: accessToken,
      timestamp,
      v: "2.0",
      sign_method: "md5",
      format: "json",
      product_id: productId,
    };

    const sign = this.generateSign(params, appSecret);
    params.sign = sign;

    const queryParams = new URLSearchParams(params);

    const res = await fetch(`https://api.taobao.com/router/rest?${queryParams.toString()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    if (!res.ok) {
      throw new Error(`AliExpress API Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    
    if (data.error_response) {
      throw new Error(`AliExpress API Error: ${data.error_response.msg} (${data.error_response.sub_msg || ''})`);
    }

    const productData = data?.aliexpress_ds_product_get_response?.result;

    if (!productData) {
      throw new Error("Product data not found in AliExpress response");
    }

    return {
      source: this.name,
      externalProductId: productId,
      externalUrl: `https://www.aliexpress.com/item/${productId}.html`,
      supplierName: productData.store_info?.store_name || "AliExpress Supplier",
      title: productData.ae_item_base_info_dto?.subject || "Unknown Product",
      description: "Imported from AliExpress. " + (productData.ae_item_base_info_dto?.subject || ""),
      originalPrice: parseFloat(productData.ae_item_sku_info_dtos?.ae_item_sku_info_d_t_o?.[0]?.sku_price || "0"),
      currency: productData.ae_item_sku_info_dtos?.ae_item_sku_info_d_t_o?.[0]?.currency_code || "USD",
      images: productData.ae_item_base_info_dto?.image_u_r_ls?.split(";") || [],
      stock: parseInt(productData.ae_item_sku_info_dtos?.ae_item_sku_info_d_t_o?.[0]?.sku_available_stock || "0", 10),
      rating: parseFloat(productData.ae_item_base_info_dto?.evaluate_rate || "0"),
      categoryName: productData.ae_item_base_info_dto?.category_id?.toString(),
    };
  }
}

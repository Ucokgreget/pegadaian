/**
 * QRIS static → dynamic converter.
 * Injects transaction amount (and optional fee) then recalculates CRC16.
 *
 * Ported from https://github.com/verssache/qris-dinamis (MIT)
 */

import { calculateCRC16 } from "./crc16.js";
import { parseTLV } from "./parser.js";

/**
 * Rebuild a QRIS string from TLV elements (without CRC).
 *
 * @param {{ tag: string, value: string, children?: any[] }[]} elements
 * @returns {string}
 */
function buildTLVString(elements) {
  return elements
    .map((el) => {
      const value = el.children ? buildTLVString(el.children) : el.value;
      const length = value.length.toString().padStart(2, "0");
      return `${el.tag}${length}${value}`;
    })
    .join("");
}

/**
 * Create a TLV element object.
 *
 * @param {string} tag
 * @param {string} value
 * @param {string} [name]
 * @returns {{ tag: string, name: string, length: number, value: string }}
 */
function makeTLV(tag, value, name = "") {
  return { tag, name, length: value.length, value };
}

/**
 * Convert a static QRIS string to dynamic by injecting amount and optional fee.
 *
 * Steps:
 *  1. Parse TLV structure
 *  2. Change Point of Initiation Method from "11" (static) → "12" (dynamic)
 *  3. Insert/replace Transaction Amount (tag 54)
 *  4. Optionally insert Tip Indicator (tag 55) and fee value (tag 56/57)
 *  5. Recalculate CRC16 checksum
 *
 * @param {string} qrisString - Static QRIS string
 * @param {{ amount: number, fee?: { type: 'fixed'|'percentage', value: number } }} options
 * @returns {string} Dynamic QRIS string
 */
export function convertQRIS(qrisString, options) {
  const elements = parseTLV(qrisString);

  const result = [];
  let amountInserted = false;

  // Tags managed (skipped then re-inserted in correct position)
  const managedTags = new Set(["54", "55", "56", "57", "63"]);

  for (const el of elements) {
    // Skip managed tags — we'll insert them ourselves
    if (managedTags.has(el.tag)) continue;

    if (el.tag === "01") {
      // Change static (11) → dynamic (12)
      result.push(makeTLV("01", "12", "Point of Initiation Method"));
      continue;
    }

    // Insert amount + optional fee BEFORE tag 58 (Country Code)
    if (el.tag === "58" && !amountInserted) {
      const amountStr = options.amount.toString();
      result.push(makeTLV("54", amountStr, "Transaction Amount"));

      if (options.fee) {
        if (options.fee.type === "fixed") {
          result.push(makeTLV("55", "02", "Tip or Convenience Indicator"));
          result.push(
            makeTLV(
              "56",
              options.fee.value.toString(),
              "Value of Convenience Fee (Fixed)"
            )
          );
        } else {
          result.push(makeTLV("55", "03", "Tip or Convenience Indicator"));
          result.push(
            makeTLV(
              "57",
              options.fee.value.toString(),
              "Value of Convenience Fee (%)"
            )
          );
        }
      }

      amountInserted = true;
    }

    result.push(el);
  }

  // Build string without CRC, then append recalculated CRC
  const withoutCRC = buildTLVString(result);
  const crcInput = withoutCRC + "6304";
  const crc = calculateCRC16(crcInput);

  return crcInput + crc;
}

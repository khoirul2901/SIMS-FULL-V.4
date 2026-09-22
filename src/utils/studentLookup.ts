/**
 * Student & Teacher Lookup and Barcode Normalization Utilities
 * Handles all barcode variations: leading zeros, AIM symbology identifiers,
 * prefix/suffix markers, case-insensitivity, URL parameters, and clean whitespace.
 */

export interface StudentMatchResult {
  student: any;
  matchedBy: 'nis' | 'idKartu' | 'barcode' | 'nisn' | 'id' | 'username' | 'relaxed';
  matchedCode: string;
}

/**
 * Clean and normalize scanned string from physical scanners (CLABEL, Barcode Gun, RFID)
 * or camera QR/barcode scanners.
 */
export function normalizeScannedCode(rawCode: string): string {
  if (!rawCode) return '';

  let code = rawCode.trim();

  // 1. Remove AIM symbology identifier (ISO/IEC 15424) common in 2D/1D scanners:
  // e.g. "]C1", "]C0", "]e0", "]d2", "]A0"
  if (/^\][A-Za-z0-9]{2}/.test(code)) {
    code = code.substring(3).trim();
  }

  // 2. Remove surrounding single or double quotes
  if ((code.startsWith('"') && code.endsWith('"')) || (code.startsWith("'") && code.endsWith("'"))) {
    code = code.slice(1, -1).trim();
  }

  // 3. Remove non-printable control characters (\r, \n, \t, etc.)
  code = code.replace(/[\x00-\x1F\x7F]/g, '').trim();

  return code;
}

/**
 * Extract possible identification tokens from a scanned code.
 * E.g., from "ID:2023001" -> ["ID:2023001", "2023001"]
 * From "https://example.com/kartu?nis=2023001" -> ["2023001", ...]
 * From JSON '{"nis":"2023001"}' -> ["2023001", ...]
 */
export function getCandidateCodes(rawCode: string): string[] {
  const clean = normalizeScannedCode(rawCode);
  if (!clean) return [];

  const candidates = new Set<string>();
  candidates.add(clean);
  candidates.add(clean.toLowerCase());
  candidates.add(clean.toUpperCase());

  // Check if JSON
  if (clean.startsWith('{') && clean.endsWith('}')) {
    try {
      const parsed = JSON.parse(clean);
      const possibleKeys = ['nis', 'id', 'idKartu', 'barcode', 'nisn', 'code', 'kartuId', 'nomor'];
      for (const k of possibleKeys) {
        if (parsed[k]) {
          const val = String(parsed[k]).trim();
          candidates.add(val);
          candidates.add(val.toLowerCase());
        }
      }
    } catch {
      // not valid json, ignore
    }
  }

  // Check if URL
  if (clean.includes('http://') || clean.includes('https://') || clean.includes('?')) {
    try {
      // Try URL query params
      const qIdx = clean.indexOf('?');
      if (qIdx !== -1) {
        const queryStr = clean.slice(qIdx + 1);
        const params = new URLSearchParams(queryStr);
        for (const k of ['nis', 'id', 'idKartu', 'barcode', 'nisn', 'code']) {
          const v = params.get(k);
          if (v) {
            candidates.add(v.trim());
            candidates.add(v.trim().toLowerCase());
          }
        }
      }

      // Try pathname last segment (e.g. /kartu/2023001)
      const pathParts = clean.split(/[/?#]/).filter(Boolean);
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && lastPart.length >= 3) {
        candidates.add(lastPart.trim());
        candidates.add(lastPart.trim().toLowerCase());
      }
    } catch {
      // url parse fallback
    }
  }

  // Check for common label prefixes like "ID: 2023001", "NIS:2023001", "CARD-2023001", "KARTU/2023001"
  const prefixMatch = clean.match(/^(?:id|nis|card|kartu|siswa|santri|nip|rfid)[\s:_/-]+(.+)$/i);
  if (prefixMatch && prefixMatch[1]) {
    const extracted = prefixMatch[1].trim();
    if (extracted) {
      candidates.add(extracted);
      candidates.add(extracted.toLowerCase());
    }
  }

  // Pure digits without leading zeros: e.g. "0002023001" -> "2023001"
  if (/^\d+$/.test(clean)) {
    const strippedZeros = clean.replace(/^0+/, '');
    if (strippedZeros.length > 0) {
      candidates.add(strippedZeros);
    }
  }

  return Array.from(candidates);
}

/**
 * Intelligently find a student from `siswaData` using candidate codes.
 * Supports:
 * - Direct NIS, ID, Barcode, ID Kartu, NISN
 * - Case-insensitive matching
 * - Leading zeros tolerance (e.g. barcode has 002023001 but NIS is 2023001 or vice-versa)
 * - Punctuation-stripped matching (e.g. "2023-001" vs "2023001")
 */
export function findStudentByScannedCode(siswaData: any[], rawCode: string): StudentMatchResult | null {
  if (!siswaData || !Array.isArray(siswaData) || siswaData.length === 0) {
    return null;
  }

  const clean = normalizeScannedCode(rawCode);
  if (!clean) return null;

  const candidates = getCandidateCodes(rawCode);

  // Phase 1: High-confidence exact matches against candidate tokens
  for (const s of siswaData) {
    if (!s) continue;

    const sNis = s.nis ? String(s.nis).trim() : '';
    const sIdKartu = s.idKartu ? String(s.idKartu).trim() : (s.barcode ? String(s.barcode).trim() : '');
    const sNisn = s.nisn ? String(s.nisn).trim() : '';
    const sId = s.id ? String(s.id).trim() : '';
    const sUsername = s.username ? String(s.username).trim() : '';

    for (const cand of candidates) {
      const candLower = cand.toLowerCase();

      // Check ID Kartu / Barcode first (if explicitly assigned)
      if (sIdKartu && (sIdKartu.toLowerCase() === candLower)) {
        return { student: s, matchedBy: 'idKartu', matchedCode: cand };
      }

      // Check NIS
      if (sNis && (sNis.toLowerCase() === candLower)) {
        return { student: s, matchedBy: 'nis', matchedCode: cand };
      }

      // Check NISN
      if (sNisn && (sNisn.toLowerCase() === candLower)) {
        return { student: s, matchedBy: 'nisn', matchedCode: cand };
      }

      // Check internal ID
      if (sId && (sId.toLowerCase() === candLower)) {
        return { student: s, matchedBy: 'id', matchedCode: cand };
      }

      // Check username
      if (sUsername && (sUsername.toLowerCase() === candLower)) {
        return { student: s, matchedBy: 'username', matchedCode: cand };
      }
    }
  }

  // Phase 2: Numeric Leading Zeros Tolerant Matching
  // e.g. Scanned barcode is "002023001" while student NIS in DB is "2023001" or vice-versa
  const cleanDigitsOnly = clean.replace(/\D/g, '');
  if (cleanDigitsOnly.length >= 3) {
    const cleanNoLeadingZero = cleanDigitsOnly.replace(/^0+/, '');

    for (const s of siswaData) {
      if (!s) continue;

      const targets = [s.nis, s.idKartu, s.barcode, s.nisn, s.id];
      for (const t of targets) {
        if (!t) continue;
        const targetDigits = String(t).replace(/\D/g, '');
        if (targetDigits.length >= 3) {
          const targetNoLeadingZero = targetDigits.replace(/^0+/, '');
          if (cleanNoLeadingZero === targetNoLeadingZero && cleanNoLeadingZero.length >= 3) {
            return { student: s, matchedBy: 'relaxed', matchedCode: clean };
          }
        }
      }
    }
  }

  // Phase 3: Stripped Punctuation Matching (e.g. "S-2023-001" vs "S2023001")
  const cleanAlphaNum = clean.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  if (cleanAlphaNum.length >= 3) {
    for (const s of siswaData) {
      if (!s) continue;
      const targets = [s.nis, s.idKartu, s.barcode, s.nisn, s.id];
      for (const t of targets) {
        if (!t) continue;
        const targetAlphaNum = String(t).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        if (targetAlphaNum.length >= 3 && cleanAlphaNum === targetAlphaNum) {
          return { student: s, matchedBy: 'relaxed', matchedCode: clean };
        }
      }
    }
  }

  return null;
}

/**
 * Intelligently find a teacher from `guruData` using candidate codes.
 */
export function findTeacherByScannedCode(guruData: any[], rawCode: string): { teacher: any; matchedBy: string; matchedCode: string } | null {
  if (!guruData || !Array.isArray(guruData) || guruData.length === 0) {
    return null;
  }

  const clean = normalizeScannedCode(rawCode);
  if (!clean) return null;

  const candidates = getCandidateCodes(rawCode);

  for (const g of guruData) {
    if (!g) continue;

    const gNip = g.nip ? String(g.nip).trim() : '';
    const gIdKartu = g.idKartu ? String(g.idKartu).trim() : (g.barcode ? String(g.barcode).trim() : '');
    const gId = g.id ? String(g.id).trim() : '';

    for (const cand of candidates) {
      const candLower = cand.toLowerCase();

      if (gIdKartu && gIdKartu.toLowerCase() === candLower) {
        return { teacher: g, matchedBy: 'idKartu', matchedCode: cand };
      }
      if (gNip && gNip.toLowerCase() === candLower) {
        return { teacher: g, matchedBy: 'nip', matchedCode: cand };
      }
      if (gId && gId.toLowerCase() === candLower) {
        return { teacher: g, matchedBy: 'id', matchedCode: cand };
      }
    }
  }

  // Relaxed digits matching for teacher NIP / ID
  const cleanDigitsOnly = clean.replace(/\D/g, '');
  if (cleanDigitsOnly.length >= 4) {
    const cleanNoZeros = cleanDigitsOnly.replace(/^0+/, '');
    for (const g of guruData) {
      if (!g) continue;
      const targets = [g.nip, g.idKartu, g.barcode, g.id];
      for (const t of targets) {
        if (!t) continue;
        const tDigits = String(t).replace(/\D/g, '').replace(/^0+/, '');
        if (tDigits.length >= 4 && cleanNoZeros === tDigits) {
          return { teacher: g, matchedBy: 'relaxed', matchedCode: clean };
        }
      }
    }
  }

  return null;
}

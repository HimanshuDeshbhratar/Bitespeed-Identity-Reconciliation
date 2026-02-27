import pool from '../config/database';
import { Contact, IdentifyRequest, IdentifyResponse } from '../types/contact';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

function normalizePhone(phone: string | number | undefined): string | undefined {
  if (phone === undefined || phone === null) return undefined;
  return String(phone).trim() || undefined;
}

function normalizeEmail(email: string | undefined): string | undefined {
  if (email === undefined || email === null) return undefined;
  return String(email).trim().toLowerCase() || undefined;
}

export async function identifyContact(
  request: IdentifyRequest
): Promise<IdentifyResponse> {
  const email = normalizeEmail(request.email);
  const phoneNumber = normalizePhone(request.phoneNumber);

  if (!email && !phoneNumber) {
    throw new Error('Either email or phoneNumber must be provided');
  }

  const conn = await pool.getConnection();

  try {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (email) {
      conditions.push('(email = ? AND deletedAt IS NULL)');
      params.push(email);
    }
    if (phoneNumber) {
      conditions.push('(phoneNumber = ? AND deletedAt IS NULL)');
      params.push(phoneNumber);
    }

    const [matchingRows] = await conn.execute<RowDataPacket[]>(
      `SELECT * FROM contact WHERE ${conditions.join(' OR ')} ORDER BY createdAt ASC`,
      params
    );

    const seenIds = new Set<number>();
    const matchingContacts = (matchingRows as unknown as Contact[]).filter(
      (c) => {
        if (seenIds.has(c.id)) return false;
        seenIds.add(c.id);
        return true;
      }
    );

    if (matchingContacts.length === 0) {
      const [insertResult] = await conn.execute<ResultSetHeader>(
        `INSERT INTO contact (phoneNumber, email, linkedId, linkPrecedence) 
         VALUES (?, ?, NULL, 'primary')`,
        [phoneNumber || null, email || null]
      );

      const primaryId = insertResult.insertId;

      return {
        contact: {
          primaryContactId: primaryId,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: [],
        },
      };
    }

    const primaryIds = new Set<number>();
    for (const c of matchingContacts) {
      if (c.linkPrecedence === 'primary') {
        primaryIds.add(c.id);
      } else if (c.linkedId) {
        primaryIds.add(c.linkedId);
      }
    }

    const primaryIdArray = Array.from(primaryIds);
    const placeholders = primaryIdArray.map(() => '?').join(',');
    const [primaryRows] = await conn.execute<RowDataPacket[]>(
      `SELECT * FROM contact WHERE id IN (${placeholders}) AND linkPrecedence = 'primary' ORDER BY createdAt ASC`,
      primaryIdArray
    );

    const primaries = primaryRows as unknown as Contact[];
    const oldestPrimary = primaries[0];

    if (primaries.length > 1) {
      for (let i = 1; i < primaries.length; i++) {
        const secondaryPrimary = primaries[i];
        await conn.execute(
          `UPDATE contact SET linkedId = ?, linkPrecedence = 'secondary', updatedAt = NOW() 
           WHERE id = ? OR linkedId = ?`,
          [oldestPrimary.id, secondaryPrimary.id, secondaryPrimary.id]
        );
      }
    }

    const [allLinkedRows] = await conn.execute<RowDataPacket[]>(
      `SELECT * FROM contact 
       WHERE (id = ? OR linkedId = ?) AND deletedAt IS NULL 
       ORDER BY linkPrecedence ASC, createdAt ASC`,
      [oldestPrimary.id, oldestPrimary.id]
    );

    const allLinked = allLinkedRows as unknown as Contact[];

    const existingEmails = new Set(allLinked.map((c) => c.email).filter(Boolean));
    const existingPhones = new Set(
      allLinked.map((c) => c.phoneNumber).filter(Boolean)
    );

    const hasNewEmail = email && !existingEmails.has(email);
    const hasNewPhone = phoneNumber && !existingPhones.has(phoneNumber);

    if (hasNewEmail || hasNewPhone) {
      const secondaryEmail = email || null;
      const secondaryPhone = phoneNumber || null;

      await conn.execute(
        `INSERT INTO contact (phoneNumber, email, linkedId, linkPrecedence) 
         VALUES (?, ?, ?, 'secondary')`,
        [secondaryPhone, secondaryEmail, oldestPrimary.id]
      );

      const [refetchedRows] = await conn.execute<RowDataPacket[]>(
        `SELECT * FROM contact 
         WHERE (id = ? OR linkedId = ?) AND deletedAt IS NULL 
         ORDER BY linkPrecedence ASC, createdAt ASC`,
        [oldestPrimary.id, oldestPrimary.id]
      );

      return buildResponse(refetchedRows as unknown as Contact[], oldestPrimary.id);
    }

    return buildResponse(allLinked, oldestPrimary.id);
  } finally {
    conn.release();
  }
}

function buildResponse(
  contacts: Contact[],
  primaryId: number
): IdentifyResponse {
  const primary = contacts.find((c) => c.id === primaryId) || contacts[0];
  const secondaries = contacts.filter((c) => c.linkPrecedence === 'secondary');

  const emails: string[] = [];
  if (primary.email) emails.push(primary.email);
  for (const s of secondaries) {
    if (s.email && !emails.includes(s.email)) emails.push(s.email);
  }

  const phoneNumbers: string[] = [];
  if (primary.phoneNumber) phoneNumbers.push(primary.phoneNumber);
  for (const s of secondaries) {
    if (s.phoneNumber && !phoneNumbers.includes(s.phoneNumber))
      phoneNumbers.push(s.phoneNumber);
  }

  return {
    contact: {
      primaryContactId: primaryId,
      emails,
      phoneNumbers,
      secondaryContactIds: secondaries.map((s) => s.id),
    },
  };
}

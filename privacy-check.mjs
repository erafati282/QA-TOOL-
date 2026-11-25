import assert from 'node:assert/strict';
import { redactPiiText, redactPiiData } from './privacy.mjs';

const fakeKey = ['sk-', 'test-token-1234567890'].join('');
const counts = {};
const filtered = redactPiiText(`Contact name: Sample Person; email: sample@example.com; phone: 0700000000; National ID: AB123456; GPS coordinates: 0.00, 0.00; card 4111 1111 1111 1111; key ${fakeKey}; token: Bearer abcdefghijklmnopqrstuvwxyz123456; address: 1 Test Street`, counts);
for (const raw of ['Sample Person', 'sample@example.com', '0700000000', 'AB123456', '0.00, 0.00', '4111 1111 1111 1111', fakeKey, 'abcdefghijklmnopqrstuvwxyz123456', '1 Test Street']) assert.equal(filtered.includes(raw), false, `unredacted value: ${raw}`);
for (const marker of ['[REDACTED_PERSON]', '[REDACTED_EMAIL]', '[REDACTED_PHONE]', '[REDACTED_ID]', '[REDACTED_COORDINATES]', '[REDACTED_CARD]', '[REDACTED_SECRET]', '[REDACTED_ADDRESS]']) assert.ok(filtered.includes(marker), `missing ${marker}`);
assert.ok(counts.email && counts.phone && counts.person_name && counts.government_id && counts.coordinates && counts.payment_card && counts.secret && counts.address);
assert.match(redactPiiText('lat: 31.95, lon: 35.91', {}), /\[REDACTED_COORDINATES\]/);

const objectCounts = {};
const safe = redactPiiData({ owner: 'Sample Person', phone: '0700000000', releaseNotes: 'Reach contact@example.com' }, objectCounts);
assert.equal(safe.owner, '[REDACTED_PERSON]');
assert.equal(safe.phone, '[REDACTED_PHONE]');
assert.equal(safe.releaseNotes, 'Reach [REDACTED_EMAIL]');
console.log('PII redaction checks passed.');

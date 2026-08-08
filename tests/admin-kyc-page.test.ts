import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('KYC admin page', () => {
  it('forces fresh database reads so newly onboarded members appear immediately', async () => {
    const pageModule = await import('../src/app/admin/investors/kyc/page.tsx');
    assert.equal(pageModule.dynamic, 'force-dynamic');
    assert.equal(pageModule.revalidate, 0);
  });
});

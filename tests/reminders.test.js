import test from 'node:test';
import assert from 'node:assert/strict';
import { reminderTimestamp, dueReminder } from '../src/utils/reminders.js';
test('Schedules today in Istanbul and rejects past or invalid times', () => {
 const now = new Date('2026-10-11T09:00:00Z');
 assert.equal(reminderTimestamp('13:30',now),Date.parse('2026-10-11T10:30:00Z'));
 assert.equal(reminderTimestamp('11:30',now),null);
 assert.equal(reminderTimestamp('25:00',now),null);
});
test('Triggers at due time once, excludes completed and cancelled visits', () => {
 const s = { status:'pending',availability:'later',reminderAt:100,reminderNotifiedAt:null };
 assert.equal(dueReminder(s,99),false); assert.equal(dueReminder(s,100),true);
 assert.equal(dueReminder({...s,reminderNotifiedAt:100},101),false);
 assert.equal(dueReminder({...s,status:'done'},101),false);
 assert.equal(dueReminder({...s,status:'cancelled'},101),false);
 assert.equal(dueReminder({...s,availability:'available'},101),false);
 assert.equal(dueReminder({...s,reminderAt:200,reminderNotifiedAt:100},201),true);
});

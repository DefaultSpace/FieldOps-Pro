import test from 'node:test';
import assert from 'node:assert/strict';
import { actionMessage } from '../src/utils/actionMessage.js';
test('One receipt with multiple record count, including old comma-separated values',()=>{
 assert.equal(actionMessage('159657654, 159657655',3,'evde değilmiş yarın ister'),'159657654 3 kaydı var evde değilmiş yarın ister');
 assert.equal(actionMessage('159657654',1,'istemiyor iptal'),'159657654 istemiyor iptal');
});

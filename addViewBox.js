import * as fs from 'fs';
import { join } from 'path';
import { sync as globSync } from 'glob';

const MESSAGES_PATTERN = join(__dirname, 'flags', '*', '*.svg');
const pattern = /(<svg.+height="(\d+)" width="(\d+)".*)>/;

const defaultMessages = globSync(MESSAGES_PATTERN)
	.map((filename) => ({ filename, content: fs.readFileSync(filename, 'utf-8') }))
	.forEach(({filename, content}) => {
		if (/viewBox/.test(content)) {
			console.log(filename, 'Already a viewBox present.');
			return;
		}
		if (!pattern.test(content)) {
			console.log(filename, 'Couldn\'t match.');
			return;
		}
		const [fullmatch, _, height, width] = content.match(pattern);
		if (!((height == 480 && width == 640) || (height == 512 && width == 512))) {
			console.log(filename, 'Unexpected dimensions', width, height);
			return;
		}
		// Replace
		fs.writeFileSync(filename, content.replace(pattern, '$1 viewBox="0 0 $3 $2">'));

	});
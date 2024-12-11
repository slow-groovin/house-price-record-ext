import fs from 'node:fs'
import path from 'node:path'


/**
 * Check if a file contains non-UTF-8 encoded characters.
 * @param {string} filePath - Path to the file to check.
 * @returns {Array} - List of invalid characters with their positions.
 */
function findNonUtf8Characters(filePath:string) {
	const invalidCharacters = [];
	const content = fs.readFileSync(filePath);

	for (let i = 0; i < content.length; i++) {
		const byte = content[i];

		// UTF-8 validation rules:
		if (byte > 0x7F) { // Multi-byte characters start with > 0x7F
			const valid = ((byte & 0b11100000) === 0b11000000 && i + 1 < content.length && (content[i + 1] & 0b11000000) === 0b10000000) || // 2-byte sequence
				((byte & 0b11110000) === 0b11100000 && i + 2 < content.length && (content[i + 1] & 0b11000000) === 0b10000000 && (content[i + 2] & 0b11000000) === 0b10000000) || // 3-byte sequence
				((byte & 0b11111000) === 0b11110000 && i + 3 < content.length && (content[i + 1] & 0b11000000) === 0b10000000 && (content[i + 2] & 0b11000000) === 0b10000000 && (content[i + 3] & 0b11000000) === 0b10000000); // 4-byte sequence
			if (!valid) {
				invalidCharacters.push({
					position: i,
					byte: byte
				});
			}
		}
	}

	return invalidCharacters;
}

/**
 * Recursively traverse a directory and process .js files.
 * @param {string} dir - Path to the directory.
 * @returns {Array} - List of files with non-UTF-8 characters.
 */
function traverseAndCheck(dir:string) {
	const results:{filePath:string, invalidChars:{position:number, byte:number}}[] = [];

	function processDirectory(currentPath:string) {
		const files = fs.readdirSync(currentPath);

		for (const file of files) {
			const filePath = path.join(currentPath, file);
			const stat = fs.statSync(filePath);

			if (stat.isDirectory()) {
				processDirectory(filePath);
			} else if (stat.isFile() && path.extname(file) === '.js') {
				const invalidChars = findNonUtf8Characters(filePath);
				if (invalidChars.length > 0) {
					results.push({ filePath, invalidChars });
				}
			}
		}
	}

	processDirectory(dir);
	return results;
}

// Example usage:
const directoryPath = 'D:\\li\\Downloads\\lapis-cv-obsidian';
const issues = traverseAndCheck(directoryPath);
if (issues.length > 0) {
	console.log('Files with non-UTF-8 characters found:');
	for (const issue of issues) {
		console.log(`File: ${issue.filePath}`);
		for (const char of issue.invalidChars) {
			console.log(`  Position: ${char.position}, Byte: ${char.byte}`);
		}
	}
} else {
	console.log('All files are valid UTF-8.');
}

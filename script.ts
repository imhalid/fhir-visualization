import * as fs from 'fs';
import * as path from 'path';

// Define the input TypeScript code as a string
const code = fs.readFileSync(path.join(__dirname, 'r4b.d.ts'), 'utf-8');

// Interfaces to hold parsed data
interface ParsedInterface {
	name: string;
	description: string;
	extends?: string;
	properties: ParsedProperty[];
}

interface ParsedProperty {
	name: string;
	description: string;
	optional: boolean;
	type: string;
}

// Function to parse the TypeScript code
function parseTypeScript(code: string): ParsedInterface[] {
	const lines = code.split('\n');
	const interfaces: ParsedInterface[] = [];
	let currentComment = '';
	let inComment = false;
	let currentInterface: ParsedInterface | null = null;

	for (let line of lines) {
		line = line.trim();
		if (line.startsWith('/**')) {
			inComment = true;
			currentComment = '';
		} else if (inComment) {
			if (line.startsWith('*/')) {
				inComment = false;
			} else {
				currentComment += line.replace(/^\s*\*\s*/, '') + '\n';
			}
		} else if (line.startsWith('export interface')) {
			const match = line.match(/export interface (\w+)(?: extends (\w+))? \{/);
			if (match) {
				const name = match[1];
				const extendsName = match[2];
				currentInterface = {
					name,
					description: currentComment.trim(),
					extends: extendsName,
					properties: []
				};
				interfaces.push(currentInterface);
				currentComment = '';
			}
		} else if (currentInterface && line.match(/^\w+\??:/)) {
			const match = line.match(/(\w+)(\??): (.+) \| undefined;/);
			if (match) {
				const propName = match[1];
				const optional = match[2] === '?';
				const type = match[3];
				currentInterface.properties.push({
					name: propName,
					description: currentComment.trim(),
					optional,
					type
				});
				currentComment = '';
			}
		} else if (line === '}') {
			currentInterface = null;
		}
	}
	return interfaces;
}

// Function to generate JSON structure
function generateJson(interfaces: ParsedInterface[]): { nodes: any[], links: any[] } {
	const nodes: any[] = [];
	const links: any[] = [];
	const interfaceIds: { [key: string]: string } = {};
	let idCounter = 0;

	// Assign IDs and create nodes
	for (const intf of interfaces) {
		const interfaceId = idCounter.toString();
		interfaceIds[intf.name] = interfaceId;
		idCounter++;

		const category = intf.extends ? 'DataType' : 'types';
		nodes.push({
			id: interfaceId,
			type: `${intf.name}_category:${category}`,
			description: intf.description || 'Base definition for all elements in a resource.' // Default for Element
		});

		let propertyCounter = 1;
		for (const prop of intf.properties) {
			const propertyId = interfaceId + propertyCounter.toString();
			const optionalMark = prop.optional ? '?' : '';
			const propType = prop.type.startsWith('(') ? `[${prop.type.replace(/'/g, '')}]` : prop.type;
			nodes.push({
				id: propertyId,
				type: `${prop.name}${optionalMark}_type:${propType}`,
				description: prop.description
			});
			links.push({ source: interfaceId, target: propertyId });
			propertyCounter++;
		}

		if (intf.extends && interfaceIds[intf.extends]) {
			links.push({ source: interfaceIds[intf.extends], target: interfaceId });
		}
	}

	return { nodes, links };
}

// Execute the transformation
const parsedInterfaces = parseTypeScript(code);
const jsonOutput = generateJson(parsedInterfaces);

// Fix the specific link typo in the desired output ("00" should be "0")
jsonOutput.links = jsonOutput.links.map(link => {
	if (link.source === "00") link.source = "0";
	return link;
});

// Write the output to a JSON file
const outputPath = path.join(__dirname, 'output.json');
fs.writeFileSync(outputPath, JSON.stringify(jsonOutput, null, 2), 'utf-8');
console.log(`JSON file generated successfully at: ${outputPath}`);
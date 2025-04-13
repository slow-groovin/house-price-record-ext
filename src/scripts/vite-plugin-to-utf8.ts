import { PluginOption } from "vite";
/*
https://github.com/qiweiii/markdown-sticky-notes/blob/master/scripts/vite-plugin-to-utf8.ts
 solution of: https://github.com/wxt-dev/wxt/issues/353
 unknown reason causing the output contains non-utf8 chars, causing browser to reject installation
 */
function customStrToUtf8(str: string) {
	return str
		.split("")
		.map((ch) =>
			ch.charCodeAt(0) <= 0x7f
				? ch
				: "\\u" + ("0000" + ch.charCodeAt(0).toString(16)).slice(-4)
		)
		.join("");
}

export default function customToUtf8(): PluginOption {
	return {
		name: "custom-to-utf8",
		generateBundle(options: any, bundle: any) {
			// Iterate through each asset in the bundle
			for (const fileName in bundle) {
				if (bundle[fileName].type === "chunk") {
					// Assuming you want to convert the chunk's code
					const originalCode = bundle[fileName].code;
					const modifiedCode = customStrToUtf8(originalCode);

					// Update the chunk's code with the modified version
					bundle[fileName].code = modifiedCode;
				}
			}
		},
	};
}

import { defineConfig } from "tsdown";

export default defineConfig({
	clean: true,
	dts: {
		oxc: true,
	},
	fixedExtension: false,
});

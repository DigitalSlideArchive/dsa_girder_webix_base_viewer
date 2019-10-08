import { mainViewPath } from "../appConfig";

class ComboURLPaths {
	constructor(app, initialPaths) {
		this.app = app;
		this.viewName = mainViewPath;
		this.paths = initialPaths || { folders: [] };
	}

	setURLComboName(comboName, value) {
		this.paths[comboName] = value;
	}

	getURLPaths() {
		return this.paths;
	}

	changeHost(value) {
		this.setURLComboName("host", value);
		delete this.paths.collection;
		this.paths.folders = [];
		this.setURLPath();
	}

	changeCollection(value) {
		this.setURLComboName("collection", value);
		this.paths.folders = [];
		this.setURLPath();
	}

	changeFolder(arr) {
		this.paths.folders = arr;
		this.setURLPath();
	}

	setURLPath() {
		let path = `${this.viewName}`;

		if (this.paths.host) {
			path += `/${this.escapeURICharacters(this.paths.host)}`;
		}

		if (this.paths.collection) {
			path += `/${this.escapeURICharacters(this.paths.collection)}`;
		}

		if (this.paths.folders.length) {
			this.paths.folders.forEach((folder) => {
				path += `/${this.escapeURICharacters(folder)}`;
			});
		}
		this.app.show(path);
		this.pathString = path;
	}

	getPathString() {
		return this.pathString;
	}

	escapeURICharacters(string) {
		return string.replace(/[;,/?:@&=+$#]/g, "");
	}

	compareStrings(str1, str2) {
		str1 = decodeURI(str1);
		str2 = decodeURI(str2);
		if (this.escapeURICharacters(str1) === this.escapeURICharacters(str2)) {
			return true;
		}
		return false;
	}
}


export default ComboURLPaths;

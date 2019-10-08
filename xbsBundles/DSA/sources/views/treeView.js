import { JetView } from "webix-jet";
import { tabsState, appSettings } from "../appConfig";
import ComboURLPaths from "../models/comboPaths";

export default class TreeView extends JetView {

	constructor(app, name) {
		super(app, name);
		// this.isTCGA = false;
		this.urlPaths = [];
	}

	config() {

		const tree = {
			view: "tree",
			select: true,
			scroll: "xy",
			css: "slidesTree",
			template: (obj, common) => {
				if (obj.$count == 0 && !obj.file)
					obj.$count = -1;
				return common.icon(obj, common) + common.folder(obj, common) + obj.name;
			},
			tooltip: (obj) => (obj.file) ? obj.name : "",
			on: {
				onItemDblClick: (id) => {
					this.getRoot().open(id);
				},
				onItemClick: (id) => {
					let item = this.getRoot().getItem(id);

					if (item.file) {

						this.setResourceUrlString(id, item.name);

						if (!item.largeImage) {
							webix.message({ type: "debug", text: "No large image file in this item." });
							this.app.callEvent("enableSwitch", [false]);
							this.app.callEvent("enableButtons", [false]);
							this.app.callEvent("clearImageTemplate", []);
							this.app.callEvent("unselectFigureButton", []);
							return;
						}

						if ((item.meta && item.meta.PDFPathReport) || (item.tcga && item.tcga.caseId)) {
							tabsState.pathologyReport = "enable";
						}
						else tabsState.pathologyReport = "disable";

						if (item.meta && item.meta.hasClinicalMetaData || (item.tcga && item.tcga.caseId)) {
							tabsState.metadata = "enable";
						}
						else tabsState.metadata = "disable";

						// if (item.meta && item.meta.dsalayers && item.meta.geojslayer) {//Properties for TCGA collection
						if (item.hasOwnProperty("tcga")) {
							this.app.callEvent("enableButtons", [true, true]);
							this.app.callEvent("enableSwitch", [true, true]);
							// this.isTCGA = false;
						}
						else {
							this.app.callEvent("enableButtons", [false, false]);
							this.app.callEvent("enableSwitch", [false]);
						}

						this.app.callEvent("hidePopup", []);
						this.app.callEvent("changeSlidesSwitch", []);
						this.app.callEvent("imageLoad", [item]);
						this.app.callEvent("setFilters", [item._id]);
						this.app.callEvent("unselectFigureButton", []);
					}
					else {
						this.urlPaths.push(item.name);
						this.setResourceUrlString(id);
					}
				},
				onBeforeOpen: (id) => {
					let item = this.getRoot().getItem(id);
					this.setId(id);
					this.loadData(item);
				}
			}
		};

		return tree;
	}

	init() {
		webix.serverURL = appSettings.serverApiURL;
		this.comboURLPaths = new ComboURLPaths(this.app);
		const tree = this.getRoot();
		webix.extend(tree, webix.ProgressBar);

		this.on(this.app, "expandSideMenu", (id) => {
			if (id === this.getRoot().getParentView().config.id) {
				if (tree.getSelectedId()) {
					tree.callEvent("onItemClick", [tree.getSelectedId()]);
				}
			}
		});
		this.getInitialFolderData();
	}

	getInitialFolderData() {
		const {
			initialParentId,
			initialParentType,
			serverApiURL
		} = appSettings;
		const tree = this.getRoot();

		if (initialParentId && initialParentType) {
			webix.ajax(`${serverApiURL}/folder?parentType=${initialParentType}&parentId=${initialParentId}`)
				.then(data => data.json())
				.then((data) => {
					tree.parse(data);
				})
				.catch((error) => {
					webix.modalbox.hideAll();
					const err = typeof error === "string" ? err : JSON.parse(error.responseText).message;
					webix.alert({
						title: "Error",
						ok: "OK",
						text: err || `Unrecognized server error: ${serverApiURL}`,
						type: "alert-error"
					});
					this.getApiCollections();
				});
		}
		else {
			this.getApiCollections();
		}
	}

	setId(id) {
		this.id = id;
	}

	getId() {
		return this.id;
	}

	getApiCollections() {
		webix.ajax(`${appSettings.serverApiURL}/collection`)
			.then((data) => {
				this.getRoot().showProgress();
				data = data.json();
				let count = 0;
				data.forEach((itemData) => {
					this.getRoot().add(itemData, count, this.getId());
					count++;
				});
				this.getRoot().hideProgress();
			})
			.catch((error) => {
				const err = typeof error === "string" ? err : error.responseText;
				webix.alert({
					title: "Error",
					ok: "OK",
					text: err || `Unrecognized server error: ${appSettings.serverApiURL}`,
					type: "alert-error"
				});
			});
	}

	loadData(item) {
		if (!item.hasOwnProperty("wasOpen")) {
			webix.ajax(`${appSettings.serverApiURL}/folder?parentType=${item._modelType}&parentId=${item._id}`)
				.then((data) => {
					this.getRoot().showProgress();
					data = data.json();
					// if (data.length && data[0].hasOwnProperty("tcga")) {
					// 	this.isTCGA = true;
					// }
					if (data.length == 0) {
						webix.ajax(`${appSettings.serverApiURL}/resource/${item._id}/items?type=${item._modelType}&limit=0`).then((dataImg) => {
							dataImg = dataImg.json();
							// if (dataImg.length && dataImg[0].hasOwnProperty("tcga")) {
							// 	this.isTCGA = true;
							// }
							let count = 0;
							dataImg.forEach((itemData) => {
								itemData.file = true;
								if (item.tcga)
									// itemData.tcga = { caseId: item.parentId };
									itemData.caseId = item.tcga.caseId;
								this.getRoot().add(itemData, count, this.getId());
								count++;
							});
							item.wasOpen = true;
							this.getRoot().hideProgress();
						});

					}
					else if (!item.hasOwnProperty("wasOpen")) {
						let count = 0;
						data.forEach((itemData) => {
							this.getRoot().add(itemData, count, this.getId());
							count++;
						});
						item.wasOpen = true;
						this.getRoot().hideProgress();
					}
				});
		}
	}

	setResourceUrlString(id, slideName) {
		if (!this.slideName && slideName) {
			this.slideName = slideName;
		}

		const parentId = this.getRoot().getParentId(id);

		if (parentId) {
			this.urlPaths.push(this.getRoot().getItem(parentId).name);
			this.setResourceUrlString(parentId);
		}
		else {
			this.comboURLPaths.changeFolder(this.urlPaths.reverse());

			let queryString = this.slideName ? `?slide=${this.slideName}` : "";
			this.app.show(`${this.comboURLPaths.getPathString()}${queryString}`);
			this.urlPaths = [];
			this.slideName = null;
		}
	}
}
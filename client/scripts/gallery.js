const gallery = {
	thumbnailCache: {},

	async init() {
		console.log("init");
		this.updateTitleBar();
		this.displayThumbnails();
	},

	updateTitleBar() {
		const titleElement = document.querySelector(".content > .title");
		if (location.pathname == "/") {
			document.querySelector(".top-nav").style.display = "none"; 
		}
		if (titleElement.textContent == "") {
			const path = location.pathname.split("/").filter(s => s != "");
			const title = path[path.length-1]
					.replace(/[_-]/g, " ")
					.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
			document.title = title;
			titleElement.textContent = title;
		}
	},

	async displayThumbnails() {
		const promises = [];
		for (var imageLink of document.querySelectorAll(".files a")) {
			const finalImageLink = imageLink;
			promises.push((async() => { 
				const imageUrl = finalImageLink.href;
				if (! imageUrl.endsWith(".jpg")) {
					return;
				}
				console.log("image: " + imageUrl);
				var thumbUrl;
				if (this.thumbnailCache[imageUrl]) {
					thumbUrl = this.thumbnailCache[imageUrl];
				} else {
					thumbUrl = await this.getThumbnailUrl(imageUrl);
					this.thumbnailCache[imageUrl] = thumbUrl;
				}
				const thumbImg = document.createElement("img");
				thumbImg.src = thumbUrl;
				thumbImg.className = "thumb";
				const label = document.createElement("span");
				label.textContent = finalImageLink.textContent;
				label.className = "label";
				finalImageLink.textContent = "";
				finalImageLink.appendChild(thumbImg);
				finalImageLink.appendChild(label);
				finalImageLink.classList.add("with-thumbnail");
			})());
		}
		await Promise.all(promises);
	},

	async getThumbnailUrl(imageUrl) {
		const bytesLength = Math.pow(2, 14);
		const thumbHeaders = { headers: { range: "bytes=0-" + (bytesLength-1)} };
		var thumbBytes = await (await fetch(imageUrl + "?bytes=" + bytesLength, thumbHeaders)).blob();
		const bytesArray = new Uint8Array(await thumbBytes.arrayBuffer());
		var start = null;
		var end = null;
		for (var i = 2; i < bytesArray.length; i++) {
			if (bytesArray[i] == 0xFF) {
				if (start == null) {
					if (bytesArray[i + 1] == 0xD8) {
						start = i;
					}
				} else {
					if (bytesArray[i + 1] == 0xD9) {
						end = i+2;
						break;
					}
				}
			}
		}
		if (start != null && end != null) {
			console.log("thumbnail found", imageUrl)
			thumbBytes = new Blob([bytesArray.slice(start, end).buffer], {type: "image/jpeg"});
		}
		return URL.createObjectURL(thumbBytes);
	}
};

// gallery.init();
document.addEventListener("turbolinks:load", gallery.init.bind(gallery));
window.gallery = gallery;
window.gallery = {
	index: null,

	async init() {
		this.index = await (await fetch("/server/data-index.json")).json();
		console.log("index", this.index);
		const titleElement = document.querySelector(".content > .title");
		if (location.pathname == "/") {
			document.querySelector(".top-nav .back").style.display = "none"; 
			// TODO: show sidebar button instead
			const siteTitleElement = document.querySelector(".top-nav .site-title");
			titleElement.textContent = siteTitleElement.textContent;
			siteTitleElement.textContent = "";
		}
		if (titleElement.textContent == "") {
			const path = location.pathname.split("/").filter(s => s != "");
			const title = path[path.length-1]
					.replace(/[_-]/g, " ")
					.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
			document.title = title;
			titleElement.textContent = title;
		}
		const descendants = this.index.filter(p => p.startsWith(location.pathname));
		const existingDescendants = new Set(document.querySelectorAll(".files a"));
		const parent = document.querySelector(".files");
		for (var descendant of descendants) {
			if (! existingDescendants.has(descendant)) {
				const a = document.createElement("a");
				a.href = descendant;
				const name = descendant
						.replace(new RegExp("^.*[\\\/]"), '')
						.replace(new RegExp("\\.[^.]+$"), "");
				a.textContent = name;
				parent.appendChild(a);
			}
		}

	}
};

window.gallery.init();
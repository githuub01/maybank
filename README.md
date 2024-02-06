// Display an area into which user details are displayed
var getOptionValue = function(context, name, defaultValue) {
	if (context.options[name] != undefined) {
		return context.options[name].get("value");
	}
	if (defaultValue != undefined) {
		return defaultValue;
	}
	return null;
};

// Define a refresh function that, when called, updates the area with the
// details of the user as retrieved by REST calls.
this._refresh = lang.hitch(this, function() {
	// If we have no variable bound to the control we have no userid to lookup
	// and hence there is nothing else to do.
	if (this.context.binding != undefined) {
	// Get the name of the user whos details we wish to look up.
		var userName = this.context.binding.get("value");
	// Build the XHR request arguments for the lookup
		var userLookupXHRArgs = {
			url: "/rest/bpm/wle/v1/user/" + userName,
			handleAs: "json",
	// Update the area with the user details
			load: lang.hitch(this, function(data) {
				html.set(query("*[id='userName']", this.context.element)[0], data.data.userName);
				html.set(query("*[id='fullName']", this.context.element)[0], data.data.fullName);
				html.set(query("*[id='email']", this.context.element)[0], data.data.emailAddress);
			}),
			error: lang.hitch(this, function(data) {
				html.set(query("*[id='userName']", this.context.element)[0], "");
				html.set(query("*[id='fullName']", this.context.element)[0], "");
				html.set(query("*[id='email']", this.context.element)[0], "");
			})
		};
	// Make the XHR request to lookup the data
		xhr.get(userLookupXHRArgs);
		
	// Build the XHR request to get the avatar image
		var imageArgs = {
			url: "/rest/bpm/wle/v1/avatar/" + userName,
			handleAs: "json",
			load: lang.hitch(this, function(data) {
				if (data.status == "200") {
					var value = "data:image/" + data.data.imageFormat + ";base64," + data.data.userAvatarImage;
				} else {
					var value = com_ibm_bpm_coach.getManagedAssetUrl("noImage.png", com_ibm_bpm_coach.assetType_WEB);
				}
				domAttr.set(query("*[id='avatar']", this.context.element)[0], "src", value);
			}),
			error: lang.hitch(this, function(data) {
				domAttr.set(query("*[id='avatar']", this.context.element)[0], "src", com_ibm_bpm_coach.getManagedAssetUrl("noImage.png", com_ibm_bpm_coach.assetType_WEB));
				console.log("Error!");
			})
		};
		xhr.get(imageArgs);
	}
});

// Handle the case where an error in configuration has been made and there
// is no bound variable.
if (this.context.binding == undefined) {
	domConstruct.create("div", {
		innerHTML: "Control: " + this.context.viewid + " - No bound variable",
		style: "color: red"
	}, this.context.element, "replace");
	return;
}

// Call the refresh function to display the details.
this._refresh();
// End of file
// End of file

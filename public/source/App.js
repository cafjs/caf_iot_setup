enyo.kind({
              name: "App",
              classes: "onyx",
              components:[
                  {kind: "onyx.Toolbar", content: "Configuring IoT device"},

		  {classes: "onyx-setup-divider", content: "Device Id"},
		  {kind: "onyx.InputDecorator",  classes: "setup-input",
                   components: [
		       {kind: "onyx.Input", classes: "setup-input",
                        name: "deviceId",
                        placeholder: "Enter device id here"}
		   ]},

		  {classes: "onyx-setup-divider", content: "Service URL"},
		  {kind: "onyx.InputDecorator",  classes: "setup-input",
                   components: [
		       {kind: "onyx.Input", classes: "setup-input",
                        name: "baseUrl",
                        placeholder: "Enter base service url  here"}
		   ]},

		  {classes: "onyx-setup-divider", content: "Git Repository"},
		  {kind: "onyx.InputDecorator", classes: "setup-input",
                   components: [
		       {kind: "onyx.Input", classes: "setup-input",
                        name: "git",
                        placeholder: "Enter git repository here"}
		   ]},

		  {classes: "onyx-setup-divider", content: "Wireless SSID"},
		  {kind: "onyx.InputDecorator",  classes: "setup-input",
                   classes: "setup-input",
                   components: [
		       {kind: "onyx.Input", classes: "setup-input",
                        name: "ssid",
                        placeholder: "Enter network SSID id here"}
		   ]},

		  {classes: "onyx-setup-divider",
                   content: "Wireless WPA password"},
		  {kind: "onyx.InputDecorator", classes: "setup-input",
                   components: [
		       {kind: "onyx.Input", classes: "setup-input",
                        type:"password",
                        name: "wpaPassword",
                        placeholder: "Enter wireless password here"}
		   ]},
		  {classes: "onyx-setup-divider",
                   content: ""},

		  {kind:"onyx.Button", content: "Do it!",
                   style: "height: 70px;", ontap:"doIt"},
                   {classes: "onyx-setup-divider",
                    content: "", name: "result"}
              ],
              create: function() {
                  this.inherited(arguments);
                  var url = location.origin + '/defaults';
                  var ajax = new enyo.Ajax({
			                       url: url,
                                               method: 'GET',
                                               handleAs: 'json',
                                               contentType: 'application/json'
		                           })
		  .response(this, "okDefaults")
		  .error(this, "errorAjax")
		  .go();
              },

              okDefaults: function(inSender, inResponse) {
                  if (typeof inResponse === 'object') {
                      this.$.wpaPassword.setValue(inResponse.wpaPassword || "");
                      this.$.ssid.setValue(inResponse.ssid || "");
                      this.$.deviceId.setValue(inResponse.deviceId || "");
                      this.$.git.setValue(inResponse.git || "");
                      this.$.baseUrl.setValue(inResponse.baseUrl || "");
                      this.render();
                  } else {
                      this.$.result.setContent("App Error:" +
                                               enyo.json
                                               .stringify(inResponse));
                  }
              },
              doIt: function(inSender, inEvent) {
                  var config = {
                      wpaPassword: this.$.wpaPassword.getValue(),
                      ssid: this.$.ssid.getValue() ,
                      deviceId: this.$.deviceId.getValue(),
                      git: this.$.git.getValue(),
                      baseUrl: this.$.baseUrl.getValue()
                  };
                  var url = location.origin + '/configure';
                  var body = enyo.json.stringify(config);
                  var ajax = new enyo.Ajax({
			                       url: url,
                                               method: 'POST',
                                               handleAs: 'json',
                                               contentType: 'application/json',
                                               postBody: body
		                           })
		  .response(this, "okDoIt")
		  .error(this, "errorAjax")
		  .go();
                  return true;
              },
              okDoIt: function(inSender, inResponse) {
                  if ((typeof inResponse === 'object') &&
                      (inResponse.ok)) {
                      this.$.result.setContent("Update successful");
                  } else {
                       this.$.result.setContent("App Error:" +
                                                enyo.json
                                                .stringify(inResponse));
                  }
              },
              errorAjax: function(inSender, inResponse) {
                  this.$.result.setContent("Error:" +
                                           enyo.json.stringify(inResponse));
              }

          });

var CoMail;
(function (CoMail) {
    function ApplySiteState(siteState) {
        UpdateSiteVersion(siteState);
        UpdateMaintenanceMessage(siteState);
    }
    CoMail.ApplySiteState = ApplySiteState;

    function UpdateSiteVersion(siteState) {
        var version = document.getElementById("SiteVersion");
        if (version === null) {
            return;
        }

        var versionText = GetPublishedVersion();
        if (versionText.length === 0) {
            versionText = "Version unavailable";
        }

        version.textContent = versionText;
        version.setAttribute("aria-label", "Published site version " + versionText);
    }

    function GetPublishedVersion() {
        var meta = document.querySelector('meta[name="site-version"]');
        if (meta !== null) {
            var content = meta.getAttribute("content");
            if (typeof content === "string") {
                var trimmed = content.trim();
                if (trimmed.length > 0) {
                    return trimmed;
                }
            }
        }

        var body = document.body;
        if (body !== null &&
            body.dataset !== undefined &&
            typeof body.dataset.siteVersion === "string") {
            var dataVersion = body.dataset.siteVersion.trim();
            if (dataVersion.length > 0) {
                return dataVersion;
            }
        }

        return "";
    }

    function UpdateMaintenanceMessage(siteState) {
        var message = document.getElementById("MaintenanceMessage");
        if (message === null) {
            return;
        }

        if (siteState !== null &&
            typeof siteState.MaintenanceMessage === "string" &&
            siteState.MaintenanceMessage.trim().length > 0) {
            message.textContent = siteState.MaintenanceMessage;
        }
    }
})(CoMail || (CoMail = {}));

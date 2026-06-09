var CoMail;
(function (CoMail) {
    function LocationHash(locationHash) {
        this.Mailbox = "";
        this.Page = 1;
        this.EmailId = -1;
        this.Subject = "";
        this.From = "";
        this.Section = "county";

        var segments = locationHash.split("&");
        for (var i = 0; i < segments.length; i++) {
            var parts = segments[i].split("=");
            switch (parts[0].toLowerCase()) {
                case "mailbox":
                    this.Mailbox = decodeValue(parts);
                    break;
                case "page":
                    this.Page = parseInt(parts[1], 10);
                    break;
                case "emailid":
                    this.EmailId = parseInt(parts[1], 10);
                    break;
                case "from":
                    this.From = decodeValue(parts);
                    break;
                case "subject":
                    this.Subject = decodeValue(parts);
                    break;
                case "section":
                    this.Section = normalizeSection(decodeValue(parts));
                    break;
            }
        }
    }

    LocationHash.prototype.AddEmailId = function (emailId) {
        var hash = "";
        if (this.Section.length > 0) {
            hash += "&section=" + encodeURIComponent(this.Section);
        }
        if (this.Mailbox.length > 0) {
            hash += "&mailbox=" + encodeURIComponent(this.Mailbox);
        }
        if (this.Page > -1) {
            hash += "&page=" + this.Page.toString();
        }
        if (this.Subject.length > 0) {
            hash += "&subject=" + encodeURIComponent(this.Subject);
        }
        if (this.From.length > 0) {
            hash += "&from=" + encodeURIComponent(this.From);
        }
        hash += "&emailid=" + emailId.toString();
        return hash.substring(1);
    };

    LocationHash.prototype.RemoveEmailId = function () {
        var hash = "";
        if (this.Section.length > 0) {
            hash += "&section=" + encodeURIComponent(this.Section);
        }
        if (this.Mailbox.length > 0) {
            hash += "&mailbox=" + encodeURIComponent(this.Mailbox);
        }
        if (this.Page > -1) {
            hash += "&page=" + this.Page.toString();
        }
        if (this.Subject.length > 0) {
            hash += "&subject=" + encodeURIComponent(this.Subject);
        }
        if (this.From.length > 0) {
            hash += "&from=" + encodeURIComponent(this.From);
        }
        return hash.substring(1);
    };

    LocationHash.prototype.ToSectionHash = function () {
        return "section=" + encodeURIComponent(this.Section);
    };

    function decodeValue(parts) {
        if (parts.length < 2) {
            return "";
        }

        return decodeURIComponent(parts[1]);
    }

    function normalizeSection(section) {
        return (section || "").toLowerCase() === "former" ? "former" : "county";
    }

    CoMail.LocationHash = LocationHash;
})(CoMail || (CoMail = {}));

var CoMail;
(function (CoMail) {
    CoMail.PageSize = 20;
})(CoMail || (CoMail = {}));

var CoMail;
(function (CoMail) {
    function PublicMailBox() {
    }

    PublicMailBox.prototype.Get = function () {
        var request = XHR.Get("API/MailBoxes");

        return new Promise(function (resolve, reject) {
            request.then(function (response) {
                resolve(JSON.parse(response.Text));
            }).catch(function () {
                console.log("error in GetMailBoxes");
                reject(null);
            });
        });
    };

    CoMail.PublicMailBox = PublicMailBox;
})(CoMail || (CoMail = {}));

/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   3.2.2+35df15ea
 */
(function () {
    "use strict";
    function t(t) { return "function" == typeof t || "object" == typeof t && null !== t; }
    function e(t) { return "function" == typeof t; }
    function n(t) { G = t; }
    function r(t) { Q = t; }
    function o() { return function () { process.nextTick(a); }; }
    function i() { return function () { B(a); }; }
    function s() { var t = 0, e = new X(a), n = document.createTextNode(""); return e.observe(n, { characterData: !0 }), function () { n.data = t = ++t % 2; }; }
    function u() { var t = new MessageChannel; return t.port1.onmessage = a, function () { t.port2.postMessage(0); }; }
    function c() { return function () { setTimeout(a, 1); }; }
    function a() { for (var t = 0; J > t; t += 2) {
        var e = tt[t], n = tt[t + 1];
        e(n), tt[t] = void 0, tt[t + 1] = void 0;
    } J = 0; }
    function f() { try {
        var t = require, e = t("vertx");
        return B = e.runOnLoop || e.runOnContext, i();
    }
    catch (n) {
        return c();
    } }
    function l(t, e) { var n = this, r = new this.constructor(p); void 0 === r[rt] && k(r); var o = n._state; if (o) {
        var i = arguments[o - 1];
        Q(function () { x(o, r, i, n._result); });
    }
    else
        E(n, r, t, e); return r; }
    function h(t) { var e = this; if (t && "object" == typeof t && t.constructor === e)
        return t; var n = new e(p); return g(n, t), n; }
    function p() { }
    function _() { return new TypeError("You cannot resolve a promise with itself"); }
    function d() { return new TypeError("A promises callback cannot return that same promise."); }
    function v(t) { try {
        return t.then;
    }
    catch (e) {
        return ut.error = e, ut;
    } }
    function y(t, e, n, r) { try {
        t.call(e, n, r);
    }
    catch (o) {
        return o;
    } }
    function m(t, e, n) { Q(function (t) { var r = !1, o = y(n, e, function (n) { r || (r = !0, e !== n ? g(t, n) : S(t, n)); }, function (e) { r || (r = !0, j(t, e)); }, "Settle: " + (t._label || " unknown promise")); !r && o && (r = !0, j(t, o)); }, t); }
    function b(t, e) { e._state === it ? S(t, e._result) : e._state === st ? j(t, e._result) : E(e, void 0, function (e) { g(t, e); }, function (e) { j(t, e); }); }
    function w(t, n, r) { n.constructor === t.constructor && r === et && constructor.resolve === nt ? b(t, n) : r === ut ? j(t, ut.error) : void 0 === r ? S(t, n) : e(r) ? m(t, n, r) : S(t, n); }
    function g(e, n) { e === n ? j(e, _()) : t(n) ? w(e, n, v(n)) : S(e, n); }
    function A(t) { t._onerror && t._onerror(t._result), T(t); }
    function S(t, e) { t._state === ot && (t._result = e, t._state = it, 0 !== t._subscribers.length && Q(T, t)); }
    function j(t, e) { t._state === ot && (t._state = st, t._result = e, Q(A, t)); }
    function E(t, e, n, r) { var o = t._subscribers, i = o.length; t._onerror = null, o[i] = e, o[i + it] = n, o[i + st] = r, 0 === i && t._state && Q(T, t); }
    function T(t) { var e = t._subscribers, n = t._state; if (0 !== e.length) {
        for (var r, o, i = t._result, s = 0; s < e.length; s += 3)
            r = e[s], o = e[s + n], r ? x(n, r, o, i) : o(i);
        t._subscribers.length = 0;
    } }
    function M() { this.error = null; }
    function P(t, e) { try {
        return t(e);
    }
    catch (n) {
        return ct.error = n, ct;
    } }
    function x(t, n, r, o) { var i, s, u, c, a = e(r); if (a) {
        if (i = P(r, o), i === ct ? (c = !0, s = i.error, i = null) : u = !0, n === i)
            return void j(n, d());
    }
    else
        i = o, u = !0; n._state !== ot || (a && u ? g(n, i) : c ? j(n, s) : t === it ? S(n, i) : t === st && j(n, i)); }
    function C(t, e) { try {
        e(function (e) { g(t, e); }, function (e) { j(t, e); });
    }
    catch (n) {
        j(t, n);
    } }
    function O() { return at++; }
    function k(t) { t[rt] = at++, t._state = void 0, t._result = void 0, t._subscribers = []; }
    function Y(t) { return new _t(this, t).promise; }
    function q(t) { var e = this; return new e(I(t) ? function (n, r) { for (var o = t.length, i = 0; o > i; i++)
        e.resolve(t[i]).then(n, r); } : function (t, e) { e(new TypeError("You must pass an array to race.")); }); }
    function F(t) { var e = this, n = new e(p); return j(n, t), n; }
    function D() { throw new TypeError("You must pass a resolver function as the first argument to the promise constructor"); }
    function K() { throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function."); }
    function L(t) { this[rt] = O(), this._result = this._state = void 0, this._subscribers = [], p !== t && ("function" != typeof t && D(), this instanceof L ? C(this, t) : K()); }
    function N(t, e) { this._instanceConstructor = t, this.promise = new t(p), this.promise[rt] || k(this.promise), I(e) ? (this._input = e, this.length = e.length, this._remaining = e.length, this._result = new Array(this.length), 0 === this.length ? S(this.promise, this._result) : (this.length = this.length || 0, this._enumerate(), 0 === this._remaining && S(this.promise, this._result))) : j(this.promise, U()); }
    function U() { return new Error("Array Methods must be provided an Array"); }
    function W() { var t; if ("undefined" != typeof global)
        t = global;
    else if ("undefined" != typeof self)
        t = self;
    else
        try {
            t = Function("return this")();
        }
        catch (e) {
            throw new Error("polyfill failed because global object is unavailable in this environment");
        } var n = t.Promise; (!n || "[object Promise]" !== Object.prototype.toString.call(n.resolve()) || n.cast) && (t.Promise = pt); }
    var z;
    z = Array.isArray ? Array.isArray : function (t) { return "[object Array]" === Object.prototype.toString.call(t); };
    var B, G, H, I = z, J = 0, Q = function (t, e) { tt[J] = t, tt[J + 1] = e, J += 2, 2 === J && (G ? G(a) : H()); }, R = "undefined" != typeof window ? window : void 0, V = R || {}, X = V.MutationObserver || V.WebKitMutationObserver, Z = "undefined" == typeof self && "undefined" != typeof process && "[object process]" === {}.toString.call(process), $ = "undefined" != typeof Uint8ClampedArray && "undefined" != typeof importScripts && "undefined" != typeof MessageChannel, tt = new Array(1e3);
    H = Z ? o() : X ? s() : $ ? u() : void 0 === R && "function" == typeof require ? f() : c();
    var et = l, nt = h, rt = Math.random().toString(36).substring(16), ot = void 0, it = 1, st = 2, ut = new M, ct = new M, at = 0, ft = Y, lt = q, ht = F, pt = L;
    L.all = ft, L.race = lt, L.resolve = nt, L.reject = ht, L._setScheduler = n, L._setAsap = r, L._asap = Q, L.prototype = { constructor: L, then: et, "catch": function (t) { return this.then(null, t); } };
    var _t = N;
    N.prototype._enumerate = function () { for (var t = this.length, e = this._input, n = 0; this._state === ot && t > n; n++)
        this._eachEntry(e[n], n); }, N.prototype._eachEntry = function (t, e) { var n = this._instanceConstructor, r = n.resolve; if (r === nt) {
        var o = v(t);
        if (o === et && t._state !== ot)
            this._settledAt(t._state, e, t._result);
        else if ("function" != typeof o)
            this._remaining--, this._result[e] = t;
        else if (n === pt) {
            var i = new n(p);
            w(i, t, o), this._willSettleAt(i, e);
        }
        else
            this._willSettleAt(new n(function (e) { e(t); }), e);
    }
    else
        this._willSettleAt(r(t), e); }, N.prototype._settledAt = function (t, e, n) { var r = this.promise; r._state === ot && (this._remaining--, t === st ? j(r, n) : this._result[e] = n), 0 === this._remaining && S(r, this._result); }, N.prototype._willSettleAt = function (t, e) { var n = this; E(t, void 0, function (t) { n._settledAt(it, e, t); }, function (t) { n._settledAt(st, e, t); }); };
    var dt = W, vt = { Promise: pt, polyfill: dt };
    "function" == typeof define && define.amd ? define(function () { return vt; }) : "undefined" != typeof module && module.exports ? module.exports = vt : "undefined" != typeof this && (this.ES6Promise = vt), dt();
}).call(this);
//# sourceMappingURL=es6-promise.min.js.map
var CoMail;
(function (CoMail) {
    function Email() {
    }

    Email.prototype.Get = function (emailId) {
        var request = XHR.Get("API/Email/" + emailId.toString());

        return new Promise(function (resolve, reject) {
            request.then(function (response) {
                resolve(JSON.parse(response.Text));
            }).catch(function () {
                console.log("error in Get Email");
                reject(null);
            });
        });
    };

    Email.prototype.GetList = function (lh) {
        if (!this.CheckMailbox(lh.Mailbox)) {
            return Promise.reject(new Error("Invalid mailbox"));
        }

        var query = buildSearchQuery(lh);
        var page = Math.max(lh.Page - 1, 0);
        var url = "API/EmailList/" + encodeURIComponent(lh.Mailbox) + "/" + page.toString() + "/" + (query.length > 0 ? "?" + query : "");
        var request = XHR.Get(url);

        return new Promise(function (resolve, reject) {
            request.then(function (response) {
                resolve(JSON.parse(response.Text));
            }).catch(function () {
                console.log("error in Get EmailList");
                reject(null);
            });
        });
    };

    Email.prototype.GetCount = function (lh) {
        if (!this.CheckMailbox(lh.Mailbox)) {
            return Promise.reject(new Error("Invalid mailbox"));
        }

        var query = buildSearchQuery(lh);
        var url = "API/EmailCount/?mailbox=" + encodeURIComponent(lh.Mailbox) + (query.length > 0 ? "&" + query : "");
        var request = XHR.Get(url);

        return new Promise(function (resolve, reject) {
            request.then(function (response) {
                resolve(JSON.parse(response.Text));
            }).catch(function () {
                console.log("error in Get EmailCount");
                reject(null);
            });
        });
    };

    Email.prototype.CheckMailbox = function (mailboxName) {
        return CoMail.mailboxes.some(function (m) {
            return m.MailboxName === mailboxName;
        });
    };

    function buildSearchQuery(lh) {
        var query = [];

        if (lh.Subject.length > 0) {
            query.push("subject=" + encodeURIComponent(lh.Subject));
        }

        if (lh.From.length > 0) {
            query.push("from=" + encodeURIComponent(lh.From));
        }

        return query.join("&");
    }

    CoMail.Email = Email;
})(CoMail || (CoMail = {}));

/// <reference path="typings/es6-promise/es6-promise.d.ts" />
/*  This code was written by macromaniac
 *  Originally pulled from: https://gist.github.com/macromaniac/e62ed27781842b6c8611 on 7/14/2016
 *  and from https://gist.github.com/takanori-ugai/8262008944769419e614
 *
 */
var XHR;
(function (XHR) {
    var Header = /** @class */ (function () {
        function Header(header, data) {
            this.header = header;
            this.data = data;
        }
        return Header;
    }());
    XHR.Header = Header;
    var Data = /** @class */ (function () {
        function Data() {
        }
        return Data;
    }());
    XHR.Data = Data;
    function DataFromJSXHR(jsXHR) {
        var data = new Data();
        data.Headers = jsXHR.getAllResponseHeaders();
        data.Text = jsXHR.responseText;
        data.Type = jsXHR.responseType;
        data.Status = jsXHR.status;
        data.StatusText = jsXHR.statusText;
        return data;
    }
    function SendCommand(method, url, headers, data) {
        if (data === void 0) { data = ""; }
        return new Promise(function (resolve, reject) {
            var jsXHR = new XMLHttpRequest();
            jsXHR.open(method, url);
            if (headers != null)
                headers.forEach(function (header) {
                    return jsXHR.setRequestHeader(header.header, header.data);
                });
            jsXHR.onload = function (ev) {
                if (jsXHR.status < 200 || jsXHR.status >= 300) {
                    reject(DataFromJSXHR(jsXHR));
                }
                resolve(DataFromJSXHR(jsXHR));
            };
            jsXHR.onerror = function (ev) {
                reject("There was an error communicating with the server.  Please check your connection and try again.");
            };
            if (data.length > 0)
                jsXHR.send(data);
            else
                jsXHR.send();
        });
    }
    function addJSONHeader(headers) {
        if (headers === null) {
            headers = [
                new XHR.Header("Content-Type", "application/json; charset=utf-8"),
                new XHR.Header("Accept", "application/json")
            ];
        }
        else {
            headers.push(new XHR.Header("Content-Type", "application/json; charset=utf-8"));
            headers.push(new XHR.Header("Accept", "application/json"));
        }
        return headers;
    }
    function Get(url, headers, isJSON) {
        if (headers === void 0) { headers = null; }
        if (isJSON === void 0) { isJSON = true; }
        headers = (isJSON ? addJSONHeader(headers) : headers);
        return SendCommand('GET', url, headers);
    }
    XHR.Get = Get;
    function Post(url, data, headers, isJSON) {
        if (data === void 0) { data = ""; }
        if (headers === void 0) { headers = null; }
        if (isJSON === void 0) { isJSON = true; }
        headers = (isJSON ? addJSONHeader(headers) : headers);
        return SendCommand('POST', url, headers, data);
    }
    XHR.Post = Post;
    function Put(url, data, headers, isJSON) {
        if (data === void 0) { data = ""; }
        if (headers === void 0) { headers = null; }
        if (isJSON === void 0) { isJSON = true; }
        headers = (isJSON ? addJSONHeader(headers) : headers);
        return SendCommand('PUT', url, headers, data);
    }
    XHR.Put = Put;
    function Delete(url, data, headers, isJSON) {
        if (data === void 0) { data = ""; }
        if (headers === void 0) { headers = null; }
        if (isJSON === void 0) { isJSON = true; }
        headers = (isJSON ? addJSONHeader(headers) : headers);
        return SendCommand('DELETE', url, headers, data);
    }
    XHR.Delete = Delete;
})(XHR || (XHR = {}));
//# sourceMappingURL=XHR.js.map
var CoMail;
(function (CoMail) {
    var emailModalRoot = null;
    var restoreFocusTo = null;
    var closeRequestHandler = null;
    var initialized = false;

    function InitializeEmailModal(onCloseRequest) {
        closeRequestHandler = onCloseRequest;
        emailModalRoot = document.getElementById("EmailView");

        if (initialized || emailModalRoot === null) {
            return;
        }

        var closeTargets = emailModalRoot.querySelectorAll("[data-email-modal-close]");
        for (var i = 0; i < closeTargets.length; i++) {
            closeTargets[i].addEventListener("click", handleCloseRequest);
        }

        emailModalRoot.addEventListener("keydown", handleKeyDown);
        emailModalRoot.setAttribute("aria-hidden", "true");
        initialized = true;
    }

    function OpenEmailModal() {
        if (emailModalRoot === null) {
            InitializeEmailModal(closeRequestHandler);
        }

        if (emailModalRoot === null) {
            return;
        }

        var activeElement = document.activeElement;
        restoreFocusTo = activeElement instanceof HTMLElement ? activeElement : null;

        resetScrollPosition();

        emailModalRoot.classList.add("is-active");
        emailModalRoot.setAttribute("aria-hidden", "false");
        document.documentElement.classList.add("is-clipped");
        resetScrollPosition();
        scheduleScrollReset();

        var focusTarget = emailModalRoot.querySelector("[data-email-modal-initial-focus]");
        if (focusTarget === null) {
            focusTarget = getFocusableElements(emailModalRoot)[0];
        }

        if (focusTarget !== undefined && focusTarget !== null) {
            if (typeof focusTarget.focus === "function") {
                try {
                    focusTarget.focus({ preventScroll: true });
                }
                catch (err) {
                    focusTarget.focus();
                }
            }
        }
    }

    function CloseEmailModal() {
        if (emailModalRoot === null) {
            return;
        }

        emailModalRoot.classList.remove("is-active");
        emailModalRoot.setAttribute("aria-hidden", "true");
        document.documentElement.classList.remove("is-clipped");
        resetScrollPosition();
        scheduleScrollReset();

        if (restoreFocusTo !== null && typeof restoreFocusTo.focus === "function") {
            restoreFocusTo.focus();
        }

        restoreFocusTo = null;
    }

    function handleCloseRequest(evt) {
        evt.preventDefault();
        requestClose(evt);
    }

    function handleKeyDown(evt) {
        if (emailModalRoot === null || !emailModalRoot.classList.contains("is-active")) {
            return;
        }

        if (evt.key === "Escape") {
            evt.preventDefault();
            requestClose(evt);
            return;
        }

        if (evt.key !== "Tab") {
            return;
        }

        var focusable = getFocusableElements(emailModalRoot);
        if (focusable.length === 0) {
            return;
        }

        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        var active = document.activeElement;

        if (evt.shiftKey) {
            if (active === first) {
                evt.preventDefault();
                last.focus();
            }
        }
        else if (active === last) {
            evt.preventDefault();
            first.focus();
        }
    }

    function requestClose(evt) {
        if (closeRequestHandler !== null) {
            closeRequestHandler(evt);
            return;
        }

        CloseEmailModal();
    }

    function getFocusableElements(root) {
        var selectors = "a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])";
        var elements = root.querySelectorAll(selectors);
        var result = [];

        for (var i = 0; i < elements.length; i++) {
            var element = elements.item(i);
            if (element !== null) {
                result.push(element);
            }
        }

        return result;
    }

    function resetScrollPosition() {
        if (emailModalRoot === null) {
            return;
        }

        emailModalRoot.scrollTop = 0;

        var modalBody = emailModalRoot.querySelector(".modal-card-body");
        if (modalBody !== null) {
            modalBody.scrollTop = 0;

            var emailMessage = modalBody.querySelector(".email-message");
            if (emailMessage !== null) {
                emailMessage.scrollTop = 0;
            }
        }
    }

    function scheduleScrollReset() {
        if (typeof window.requestAnimationFrame === "function") {
            window.requestAnimationFrame(function () {
                resetScrollPosition();
            });
            return;
        }

        setTimeout(resetScrollPosition, 0);
    }

    CoMail.InitializeEmailModal = InitializeEmailModal;
    CoMail.OpenEmailModal = OpenEmailModal;
    CoMail.CloseEmailModal = CloseEmailModal;
})(CoMail || (CoMail = {}));

var CoMail;
(function (CoMail) {
    function BuildEmailView(e) {
        SetValue("EmailSubject", e.Subject);
        SetValue("EmailDateReceived", e.DateReceived_ToString);
        SetValue("EmailFrom", e.From);
        SetValue("EmailTo", e.To);
        SetValue("EmailCc", e.CC);

        var emailMessage = document.getElementById("EmailMessage");
        if (emailMessage !== null) {
            clearElement(emailMessage);

            var bodyWrapper = document.createElement("div");
            bodyWrapper.classList.add("email-body");

            var parser = new DOMParser();
            var parsed = parser.parseFromString(e.Body || "", "text/html");
            var html = parsed.body !== null && parsed.body.innerHTML.length > 0 ? parsed.body.innerHTML : (e.Body || "");
            bodyWrapper.innerHTML = html;

            emailMessage.appendChild(bodyWrapper);
        }

        AddAttachments(e.Attachments || []);
    }
    CoMail.BuildEmailView = BuildEmailView;

    function AddAttachments(attachments) {
        var attachmentContainer = document.getElementById("EmailAttachments");
        if (attachmentContainer === null) {
            return;
        }

        clearElement(attachmentContainer);

        if (attachments.length === 0) {
            var none = document.createElement("span");
            none.classList.add("has-text-grey");
            none.textContent = "None";
            attachmentContainer.appendChild(none);
            return;
        }

        var tags = document.createElement("div");
        tags.classList.add("tags");

        for (var i = 0; i < attachments.length; i++) {
            var a = attachments[i];
            var tag = document.createElement("a");
            tag.classList.add("tag", "is-link", "is-light", "attachment-tag");
            tag.href = a.URL;
            tag.setAttribute("aria-label", "Open attachment " + a.Filename);

            var icon = document.createElement("span");
            icon.classList.add("icon", "is-small");
            icon.setAttribute("aria-hidden", "true");
            icon.appendChild(CreatePaperclipIcon());

            var label = document.createElement("span");
            label.textContent = a.Filename;

            tag.appendChild(icon);
            tag.appendChild(label);
            tags.appendChild(tag);
        }

        attachmentContainer.appendChild(tags);
    }

    function SetValue(id, value) {
        var e = document.getElementById(id);
        if (e === null) {
            return;
        }

        e.textContent = value || "";
    }

    function UpdateMailboxName(mailboxName) {
        var mailbox = CoMail.mailboxes.filter(function (m) {
            return m.MailboxName === mailboxName;
        });

        var mailboxNameElement = document.getElementById("MailboxName");
        if (mailboxNameElement === null) {
            return;
        }

        mailboxNameElement.textContent = mailbox.length === 1 ? mailbox[0].Name : "";
    }
    CoMail.UpdateMailboxName = UpdateMailboxName;

    function ClearEmailList() {
        var emailList = document.getElementById("EmailList");
        if (emailList === null) {
            return null;
        }

        clearElement(emailList);
        return emailList;
    }
    CoMail.ClearEmailList = ClearEmailList;

    function BuildEmailList() {
        var emailList = ClearEmailList();
        if (emailList === null) {
            return;
        }

        var fragment = document.createDocumentFragment();

        for (var i = 0; i < CoMail.currentEmailList.length; i++) {
            var email = CoMail.currentEmailList[i];
            var emailHref = CoMail.currentHash === null ? "#" : "#" + CoMail.currentHash.AddEmailId(email.Id);

            var row = document.createElement("tr");
            row.classList.add("email-row", "email-row--clickable");
            row.addEventListener("click", CreateEmailRowClickHandler(emailHref));

            row.appendChild(CreateEmailDateCell(email.DateReceived_ToString, email.DateReceived_DateOnlyString));
            row.appendChild(CreateEmailListCell("email-from-cell", email.From));

            var subjectCell = CreateEmailListCell("email-subject-cell", email.Subject);
            subjectCell.title = email.Subject;
            row.appendChild(subjectCell);

            var actionCell = CreateEmailListCell("email-action-cell", "");
            actionCell.classList.add("has-text-centered");

            var viewButton = document.createElement("a");
            viewButton.classList.add("button", "is-link", "is-light", "is-small", "email-view-button");
            viewButton.href = emailHref;
            viewButton.setAttribute("aria-label", "View email: " + email.Subject);
            viewButton.setAttribute("aria-haspopup", "dialog");
            viewButton.setAttribute("aria-controls", "EmailView");

            var buttonIcon = document.createElement("span");
            buttonIcon.classList.add("icon", "is-small");
            buttonIcon.setAttribute("aria-hidden", "true");
            buttonIcon.appendChild(CreateEnvelopeIcon());

            var buttonLabel = document.createElement("span");
            buttonLabel.textContent = "View";

            viewButton.appendChild(buttonIcon);
            viewButton.appendChild(buttonLabel);
            actionCell.appendChild(viewButton);
            row.appendChild(actionCell);
            fragment.appendChild(row);
        }

        emailList.appendChild(fragment);
    }
    CoMail.BuildEmailList = BuildEmailList;

    function CreateEmailDateCell(fullText, mobileText) {
        var cell = document.createElement("td");
        cell.classList.add("email-date-cell");
        cell.title = fullText || mobileText || "";

        var desktopValue = document.createElement("span");
        desktopValue.classList.add("email-date-cell__full");
        desktopValue.textContent = fullText || "";

        var mobileValue = document.createElement("span");
        mobileValue.classList.add("email-date-cell__short");
        mobileValue.textContent = mobileText || fullText || "";

        cell.appendChild(desktopValue);
        cell.appendChild(mobileValue);
        return cell;
    }

    function CreateEmailListCell(className, text) {
        var cell = document.createElement("td");
        cell.classList.add(className);

        if (text !== null && text !== undefined && text.length > 0) {
            cell.textContent = text;
        }

        return cell;
    }

    function CreateEmailRowClickHandler(emailHref) {
        return function () {
            if (emailHref.length > 1) {
                location.hash = emailHref.substring(1);
            }
        };
    }

    function IsFormerCommissioner(title) {
        var normalizedTitle = (title || "").toLowerCase();
        return normalizedTitle.indexOf("commissioner") > -1;
    }

    function GetMailboxDistrict(mailbox) {
        if (mailbox === null || mailbox === undefined) {
            return 0;
        }

        var district = parseInt(mailbox.District, 10);
        if (!isNaN(district) && district > 0) {
            return district;
        }

        var title = mailbox.Title || "";
        var match = /District\s+(\d+)/i.exec(title);
        return match !== null ? parseInt(match[1], 10) || 0 : 0;
    }

    function GetMailboxFinalTermYear(mailbox) {
        if (mailbox === null || mailbox === undefined) {
            return 0;
        }

        var finalTermYear = parseInt(mailbox.FinalTermYear, 10);
        return isNaN(finalTermYear) ? 0 : finalTermYear;
    }

    function CompareFormerCommissioners(left, right) {
        var leftYear = GetMailboxFinalTermYear(left);
        var rightYear = GetMailboxFinalTermYear(right);

        if (leftYear !== rightYear) {
            return leftYear - rightYear;
        }

        var leftName = (left.Name || "").toLowerCase();
        var rightName = (right.Name || "").toLowerCase();
        if (leftName !== rightName) {
            return leftName.localeCompare(rightName);
        }

        var leftMailbox = (left.MailboxName || "").toLowerCase();
        var rightMailbox = (right.MailboxName || "").toLowerCase();
        return leftMailbox.localeCompare(rightMailbox);
    }

    function SetCommissionerSection(section) {
        var normalizedSection = NormalizeSection(section);
        CoMail.currentSection = normalizedSection;

        var county = document.getElementById("CountyCommissionersSection");
        var former = document.getElementById("FormerCommissionersSection");
        var countyButton = document.getElementById("CountyCommissionersButton");
        var formerButton = document.getElementById("FormerCommissionersButton");

        if (county !== null) {
            var countyHidden = normalizedSection !== "county";
            county.hidden = countyHidden;
            county.classList.toggle("is-hidden", countyHidden);
            county.setAttribute("aria-hidden", countyHidden ? "true" : "false");
            county.style.display = countyHidden ? "none" : "";
        }

        if (former !== null) {
            var formerHidden = normalizedSection !== "former";
            former.hidden = formerHidden;
            former.classList.toggle("is-hidden", formerHidden);
            former.setAttribute("aria-hidden", formerHidden ? "true" : "false");
            former.style.display = formerHidden ? "none" : "";
        }

        UpdateSectionButton(countyButton, normalizedSection === "county");
        UpdateSectionButton(formerButton, normalizedSection === "former");
    }
    CoMail.SetCommissionerSection = SetCommissionerSection;

    function UpdateReturnLink(section) {
        var link = document.getElementById("ReturnToSection");
        var close = document.getElementById("CloseMailboxView");
        if (link === null) {
            if (close !== null) {
                close.href = "#section=" + encodeURIComponent(NormalizeSection(section));
                close.setAttribute("aria-label", "Close mailbox archive");
            }
            return;
        }

        var normalizedSection = NormalizeSection(section);
        var href = "#section=" + encodeURIComponent(normalizedSection);
        link.href = href;
        link.textContent = normalizedSection === "former"
            ? "Return to Former Commissioners"
            : "Return to County Commissioners";
        link.setAttribute("aria-label", link.textContent);

        if (close !== null) {
            close.href = href;
            close.setAttribute("aria-label", "Close mailbox archive");
        }
    }
    CoMail.UpdateReturnLink = UpdateReturnLink;

    function ResetMailboxView() {
        SetValue("MailboxName", "");
        SetValue("TotalPageCount", "");

        var prev = document.getElementById("PreviousPage");
        if (prev !== null) {
            prev.href = "#";
            prev.classList.add("is-disabled");
            prev.setAttribute("aria-disabled", "true");
            prev.tabIndex = -1;
        }

        var next = document.getElementById("NextPage");
        if (next !== null) {
            next.href = "#";
            next.classList.add("is-disabled");
            next.setAttribute("aria-disabled", "true");
            next.tabIndex = -1;
        }

        clearElement(document.getElementById("EmailList"));
    }
    CoMail.ResetMailboxView = ResetMailboxView;

    function UpdateSectionButton(button, isSelected) {
        if (button === null) {
            return;
        }

        button.classList.toggle("is-active", isSelected);
        button.setAttribute("aria-selected", isSelected ? "true" : "false");
    }

    function NormalizeSection(section) {
        return (section || "").toLowerCase() === "former" ? "former" : "county";
    }

    function BuildMailboxes() {
        var commissioners = document.getElementById("Commissioners");
        var former = document.getElementById("FormerCommissioners");
        var other = document.getElementById("OtherPublic");
        var formerCommissioners = [];

        if (commissioners === null || former === null || other === null) {
            return;
        }

        clearElement(commissioners);
        clearElement(former);
        clearElement(other);

        for (var i = 0; i < CoMail.mailboxes.length; i++) {
            var m = CoMail.mailboxes[i];
            if (m.Active === 0) {
                if (IsFormerCommissioner(m.Title)) {
                    formerCommissioners.push(m);
                }
                else {
                    other.appendChild(BuildMailboxItem(m, CoMail.currentSection || "county", false));
                }
            }
            else {
                commissioners.appendChild(BuildMailboxItem(m, "county", true));
            }
        }

        BuildFormerCommissionerSections(former, formerCommissioners);
        SyncFormerCommissionerDistricts();
        SetCommissionerSection(CoMail.currentSection || "county");
        Show("MailboxList");
        Hide("MailboxView");
    }
    CoMail.BuildMailboxes = BuildMailboxes;

    function BuildFormerCommissionerSections(container, mailboxes) {
        var formerMailboxes = mailboxes.slice(0);
        formerMailboxes.sort(CompareFormerCommissioners);
        var mobileLayout = IsMobileFormerCommissionerLayout();

        for (var district = 1; district <= 5; district++) {
            var districtSection = document.createElement("details");
            districtSection.classList.add("former-commissioners__district");
            districtSection.id = "FormerCommissionersDistrict" + district;
            districtSection.open = !mobileLayout;
            var cardsId = districtSection.id + "Cards";

            districtSection.addEventListener("toggle", (function (section) {
                return function () {
                    var summary = section.querySelector(".former-commissioners__district-header");
                    var status = section.querySelector(".former-commissioners__district-status");
                    if (summary !== null) {
                        summary.setAttribute("aria-expanded", section.open ? "true" : "false");
                    }
                    if (status !== null) {
                        status.textContent = section.open
                            ? "expanded, click to collapse section to hide commissioners"
                            : "collapsed, click to expand section to view commissioners";
                    }

                    if (!IsMobileFormerCommissionerLayout()) {
                        return;
                    }

                    section.setAttribute("data-mobile-open", section.open ? "true" : "false");
                };
            })(districtSection));

            var districtHeader = document.createElement("summary");
            districtHeader.classList.add("former-commissioners__district-header", "former-commissioners__district-summary");
            districtHeader.setAttribute("aria-controls", cardsId);
            districtHeader.setAttribute("aria-expanded", districtSection.open ? "true" : "false");

            var heading = document.createElement("h3");
            heading.classList.add("title", "is-5", "former-commissioners__district-title");

            var headingDesktop = document.createElement("span");
            headingDesktop.classList.add("former-commissioners__district-label", "former-commissioners__district-label--desktop");
            headingDesktop.textContent = "Former Commissioners for District " + district;

            var headingMobile = document.createElement("span");
            headingMobile.classList.add("former-commissioners__district-label", "former-commissioners__district-label--mobile");
            headingMobile.textContent = "District " + district;

            heading.appendChild(headingDesktop);
            heading.appendChild(headingMobile);

            var status = document.createElement("span");
            status.classList.add("is-sr-only", "former-commissioners__district-status");
            status.textContent = districtSection.open
                ? "expanded, click to collapse section to hide commissioners"
                : "collapsed, click to expand section to view commissioners";

            var cards = document.createElement("div");
            cards.id = cardsId;
            cards.classList.add("columns", "is-multiline", "is-variable", "is-4", "former-commissioners__cards");

            for (var i = 0; i < formerMailboxes.length; i++) {
                var mailbox = formerMailboxes[i];
                if (GetMailboxDistrict(mailbox) !== district) {
                    continue;
                }

                cards.appendChild(BuildMailboxItem(mailbox, "former", true));
            }

            districtHeader.appendChild(heading);
            districtHeader.appendChild(status);
            districtHeader.appendChild(CreateFormerCommissionerChevron());
            districtSection.appendChild(districtHeader);
            districtSection.appendChild(cards);
            container.appendChild(districtSection);
        }
    }
    CoMail.BuildFormerCommissionerSections = BuildFormerCommissionerSections;

    function SyncFormerCommissionerDistricts() {
        var sections = document.querySelectorAll(".former-commissioners__district");
        if (sections === null || sections.length === 0) {
            return;
        }

        var mobileLayout = IsMobileFormerCommissionerLayout();
        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            var summary = section.querySelector(".former-commissioners__district-header");
            var status = section.querySelector(".former-commissioners__district-status");
            if (mobileLayout) {
                var isOpen = section.getAttribute("data-mobile-open");
                section.open = isOpen === null ? false : isOpen === "true";
            }
            else {
                section.open = true;
            }

            if (summary !== null) {
                summary.setAttribute("aria-expanded", section.open ? "true" : "false");
            }
            if (status !== null) {
                status.textContent = section.open
                    ? "expanded, click to collapse section to hide commissioners"
                    : "collapsed, click to expand section to view commissioners";
            }
        }
    }
    CoMail.SyncFormerCommissionerDistricts = SyncFormerCommissionerDistricts;

    function IsMobileFormerCommissionerLayout() {
        if (window.matchMedia === undefined) {
            return false;
        }

        return window.matchMedia("(max-width: 768px)").matches;
    }
    CoMail.IsMobileFormerCommissionerLayout = IsMobileFormerCommissionerLayout;

    function CreateFormerCommissionerChevron() {
        var icon = document.createElement("span");
        icon.classList.add("icon", "is-small", "former-commissioners__district-icon");
        icon.setAttribute("aria-hidden", "true");
        icon.appendChild(CreateChevronDownIcon());
        return icon;
    }

    function BuildMailboxItem(mailbox, section, isCommissionerCard) {
        var column = document.createElement("div");
        column.classList.add("column", "is-half-tablet", "is-one-third-desktop");

        var sectionKind = NormalizeSection(section || CoMail.currentSection || "county");
        var cardHref = "#section=" + encodeURIComponent(sectionKind)
            + "&mailbox=" + encodeURIComponent(mailbox.MailboxName)
            + "&page=1";

        var card = document.createElement("a");
        card.classList.add("card", "mailbox-card", "mailbox-card--link");
        if (isCommissionerCard) {
            card.classList.add("mailbox-card--commissioner");
        }
        card.href = cardHref;
        card.setAttribute("aria-label", BuildMailboxCardLabel(mailbox, sectionKind, isCommissionerCard));

        var content = document.createElement("div");
        content.classList.add("card-content", "mailbox-card__content");

        var details = document.createElement("div");
        details.classList.add("mailbox-card__details");

        var heading = document.createElement("h3");
        heading.classList.add("title", "is-5", "mailbox-card__name");
        heading.textContent = mailbox.Name;

        if (isCommissionerCard && sectionKind === "county") {
            var district = GetMailboxDistrict(mailbox);
            var meta = document.createElement("p");
            meta.classList.add("mailbox-card__meta");
            meta.textContent = district > 0 ? "District " + district : "District";
            details.appendChild(meta);
        }

        var headline = document.createElement("div");
        headline.classList.add("mailbox-card__headline");

        headline.appendChild(heading);

        if (isCommissionerCard) {
            var icon = document.createElement("span");
            icon.classList.add("icon", "is-small", "mailbox-card__icon");
            icon.setAttribute("aria-hidden", "true");
            icon.appendChild(CreateEnvelopeIcon());
            headline.appendChild(icon);
        }

        details.appendChild(headline);
        content.appendChild(details);
        card.appendChild(content);
        column.appendChild(card);
        return column;
    }
    CoMail.BuildMailboxItem = BuildMailboxItem;

    function BuildMailboxCardLabel(mailbox, sectionKind, isCommissionerCard) {
        var district = GetMailboxDistrict(mailbox);
        var districtLabel = district > 0 ? "District " + district : "District";

        if (isCommissionerCard && sectionKind === "former") {
            return "View emails for Former " + districtLabel + " Commissioner " + mailbox.Name;
        }

        return "View emails for " + districtLabel + " Commissioner " + mailbox.Name;
    }

    function clearElement(node) {
        if (node === null) {
            return;
        }

        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }
    CoMail.clearElement = clearElement;

    function CreateEnvelopeIcon() {
        var svg = CreateInlineIcon();
        var body = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        body.setAttribute("x", "3");
        body.setAttribute("y", "5");
        body.setAttribute("width", "18");
        body.setAttribute("height", "14");
        body.setAttribute("rx", "1.75");
        body.setAttribute("fill", "none");
        body.setAttribute("stroke", "currentColor");
        body.setAttribute("stroke-width", "1.75");

        var flap = document.createElementNS("http://www.w3.org/2000/svg", "path");
        flap.setAttribute("d", "M3.75 6.5L12 12.5L20.25 6.5");
        flap.setAttribute("fill", "none");
        flap.setAttribute("stroke", "currentColor");
        flap.setAttribute("stroke-width", "1.75");

        var lower = document.createElementNS("http://www.w3.org/2000/svg", "path");
        lower.setAttribute("d", "M3.75 18.25L9.9 12.85");
        lower.setAttribute("fill", "none");
        lower.setAttribute("stroke", "currentColor");
        lower.setAttribute("stroke-width", "1.75");

        var lowerRight = document.createElementNS("http://www.w3.org/2000/svg", "path");
        lowerRight.setAttribute("d", "M20.25 18.25L14.1 12.85");
        lowerRight.setAttribute("fill", "none");
        lowerRight.setAttribute("stroke", "currentColor");
        lowerRight.setAttribute("stroke-width", "1.75");

        svg.appendChild(body);
        svg.appendChild(flap);
        svg.appendChild(lower);
        svg.appendChild(lowerRight);
        return svg;
    }

    function CreatePaperclipIcon() {
        var svg = CreateInlineIcon();
        var clip = document.createElementNS("http://www.w3.org/2000/svg", "path");
        clip.setAttribute("d", "M14 6.5V14a4 4 0 1 1-8 0V8a2.5 2.5 0 1 1 5 0v5.5a1 1 0 1 1-2 0V8.75");
        clip.setAttribute("fill", "none");
        clip.setAttribute("stroke", "currentColor");
        clip.setAttribute("stroke-width", "1.75");
        svg.appendChild(clip);
        return svg;
    }

    function CreateChevronDownIcon() {
        var svg = CreateInlineIcon();
        var chevron = document.createElementNS("http://www.w3.org/2000/svg", "path");
        chevron.setAttribute("d", "M6.5 9.5L12 15l5.5-5.5");
        chevron.setAttribute("fill", "none");
        chevron.setAttribute("stroke", "currentColor");
        chevron.setAttribute("stroke-width", "1.9");
        svg.appendChild(chevron);
        return svg;
    }

    function CreateInlineIcon() {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");
        svg.setAttribute("role", "presentation");
        svg.classList.add("inline-icon-svg");
        return svg;
    }

    function Show(id) {
        var e = document.getElementById(id);
        if (e === null) {
            return;
        }

        e.hidden = false;
        e.setAttribute("aria-hidden", "false");

        if (id === "MailboxView") {
            e.classList.add("mailbox-archive--open");
        }
    }
    CoMail.Show = Show;

    function Hide(id) {
        var e = document.getElementById(id);
        if (e === null) {
            return;
        }

        e.hidden = true;
        e.setAttribute("aria-hidden", "true");

        if (id === "MailboxView") {
            e.classList.remove("mailbox-archive--open");
        }
    }
    CoMail.Hide = Hide;
})(CoMail || (CoMail = {}));

var CoMail;
(function (CoMail) {
    CoMail.mailboxes = [];
    CoMail.currentEmailList = [];
    CoMail.currentHash = null;
    CoMail.currentEmailCount = 0;
    CoMail.currentSection = "county";

    var loadingOperations = 0;

    function Start() {
        loadingOperations = 0;
        CoMail.Hide("Loading");
        SetLoadingModalState(false);
        CoMail.InitializeEmailModal(ModalClosed);
        window.onhashchange = HashChange;
        window.addEventListener("resize", ViewportChanged);
        GetMailBoxes();

        if (location.hash.substring(1).length === 0) {
            FocusBrandLink();
        }
    }
    CoMail.Start = Start;

    function ModalClosed(evt) {
        if (evt !== undefined && evt !== null) {
            evt.preventDefault();
        }

        if (CoMail.currentHash !== null) {
            location.hash = CoMail.currentHash.RemoveEmailId();
        }

        var emailMessage = document.getElementById("EmailMessage");
        CoMail.clearElement(emailMessage);
        CoMail.CloseEmailModal();
    }
    CoMail.ModalClosed = ModalClosed;

    function HashChange() {
        HandleHash();
    }
    CoMail.HashChange = HashChange;

    function ViewportChanged() {
        if (CoMail.SyncFormerCommissionerDistricts !== undefined) {
            CoMail.SyncFormerCommissionerDistricts();
        }

        if (CoMail.currentHash === null) {
            return;
        }

        UpdateArchiveVisibility(CoMail.currentHash, false);
    }

    function HandleHash() {
        var oldHash = CoMail.currentHash;
        CoMail.currentHash = new CoMail.LocationHash(location.hash.substring(1));
        CoMail.currentSection = CoMail.currentHash.Section;
        ShowMenu(CoMail.currentHash, oldHash);
    }

    function ShowMenu(lh, oh) {
        if (lh.Mailbox.length === 0) {
            UpdateArchiveVisibility(lh, true);
            CoMail.CloseEmailModal();
        }
        else {
            if (HasMailboxViewChanged(lh, oh)) {
                CoMail.UpdateMailboxName(lh.Mailbox);
                GetEmailList(CoMail.currentHash);
                GetEmailCount(CoMail.currentHash);
            }

            CoMail.UpdateReturnLink(lh.Section);
            UpdateArchiveVisibility(lh, false);

            if (lh.EmailId < 0) {
                CoMail.CloseEmailModal();
                FocusMailboxName();
            }
        }

        if (lh.EmailId > -1) {
            GetEmail(lh.EmailId);
        }
    }

    function UpdateArchiveVisibility(lh, resetSelectionState) {
        var wideLayout = IsWideArchiveLayout();

        if (lh.Mailbox.length === 0) {
            if (resetSelectionState) {
                CoMail.ResetMailboxView();
            }

            CoMail.SetCommissionerSection(lh.Section);
            CoMail.Show("MailboxList");
            CoMail.Hide("MailboxView");
            SetArchiveModalState(false);
            window.scrollTo(0, 0);
            return;
        }

        CoMail.Show("MailboxView");
        SetArchiveModalState(wideLayout);

        var mailboxView = document.getElementById("MailboxView");
        if (mailboxView !== null) {
            mailboxView.scrollTop = 0;
        }

        CoMail.Hide("MailboxList");

        if (!wideLayout) {
            window.scrollTo(0, 0);
        }
    }

    function FocusMailboxName() {
        var mailboxName = document.getElementById("MailboxName");
        if (mailboxName === null || typeof mailboxName.focus !== "function") {
            return;
        }

        try {
            mailboxName.focus({ preventScroll: true });
        }
        catch (err) {
            mailboxName.focus();
        }
    }

    function FocusBrandLink() {
        var brandLink = document.getElementById("SiteBrandLink");
        if (brandLink === null || typeof brandLink.focus !== "function") {
            return;
        }

        if (typeof window.requestAnimationFrame === "function") {
            window.requestAnimationFrame(function () {
                try {
                    brandLink.focus({ preventScroll: true });
                }
                catch (err) {
                    brandLink.focus();
                }
            });
            return;
        }

        try {
            brandLink.focus({ preventScroll: true });
        }
        catch (err) {
            brandLink.focus();
        }
    }

    function SetArchiveModalState(isOpen) {
        document.body.classList.toggle("archive-modal-open", isOpen);
        document.documentElement.classList.toggle("archive-modal-open", isOpen);
    }

    function IsWideArchiveLayout() {
        if (window.matchMedia === undefined) {
            return true;
        }

        return window.matchMedia("(min-width: 769px)").matches;
    }

    function HasMailboxViewChanged(lh, oh) {
        if (oh === null) {
            return true;
        }

        return oh.Mailbox !== lh.Mailbox ||
            oh.Page !== lh.Page ||
            oh.Subject !== lh.Subject ||
            oh.From !== lh.From;
    }

    function GetEmail(emailId) {
        BeginLoading();
        var email = new CoMail.Email();
        email.Get(emailId)
            .then(function (mail) {
                try {
                    CoMail.BuildEmailView(mail);
                    CoMail.OpenEmailModal();
                }
                finally {
                    EndLoading();
                }
            }, function () {
                console.log("error getting Email");
                EndLoading();
            });
    }

    function GetEmailList(lh) {
        BeginLoading();
        CoMail.ClearEmailList();

        var email = new CoMail.Email();
        email.GetList(lh)
            .then(function (allmail) {
                try {
                    CoMail.currentEmailList = allmail;
                    CoMail.BuildEmailList();
                }
                finally {
                    EndLoading();
                }
            }, function () {
                console.log("error getting Email List");
                EndLoading();
            });
    }

    function GetEmailCount(lh) {
        var email = new CoMail.Email();
        email.GetCount(lh)
            .then(function (emailCount) {
                CoMail.currentEmailCount = emailCount;
                BuildPaging();
            }, function () {
                console.log("error getting Email Count");
            });
    }

    function BuildPaging() {
        if (CoMail.currentHash === null) {
            return;
        }

        var totalPageCount = document.getElementById("TotalPageCount");
        if (totalPageCount !== null) {
            CoMail.clearElement(totalPageCount);
            var max = Math.max(Math.ceil(CoMail.currentEmailCount / CoMail.PageSize), 1);
            totalPageCount.textContent = "Page " + CoMail.currentHash.Page + " of " + max;

            var prev = document.getElementById("PreviousPage");
            UpdatePage(prev, CoMail.currentHash.Page - 1, max);

            var next = document.getElementById("NextPage");
            UpdatePage(next, CoMail.currentHash.Page + 1, max);
        }
    }

    function UpdatePage(a, page, max) {
        if (a === null) {
            return;
        }

        var disabled = page < 1 || page > max;
        a.classList.toggle("is-disabled", disabled);
        a.setAttribute("aria-disabled", disabled ? "true" : "false");
        a.tabIndex = disabled ? -1 : 0;

        if (disabled) {
            a.href = location.hash || "#";
            a.onclick = function (evt) {
                evt.preventDefault();
                return false;
            };
            return;
        }

        a.onclick = null;
        a.href = location.hash;

        if (a.href.indexOf("page=") > -1) {
            a.href = a.href.replace("page=" + CoMail.currentHash.Page, "page=" + page);
        }
        else {
            a.href += "&page=" + page;
        }
    }

    function GetMailBoxes() {
        BeginLoading();
        var mb = new CoMail.PublicMailBox();
        mb.Get()
            .then(function (all) {
                try {
                    CoMail.mailboxes = all;
                    if (location.hash.substring(1).length > 0) {
                        var initialHash = new CoMail.LocationHash(location.hash.substring(1));
                        CoMail.currentSection = initialHash.Section;
                    }

                    CoMail.BuildMailboxes();
                }
                finally {
                    EndLoading();
                }

                if (location.hash.substring(1).length > 0) {
                    HandleHash();
                }
            }, function () {
                console.log("error getting All Mailboxes");
                EndLoading();
            });
    }

    function BeginLoading() {
        if (loadingOperations === 0) {
            CoMail.Show("Loading");
            SetLoadingModalState(true);
        }

        loadingOperations++;
    }

    function EndLoading() {
        if (loadingOperations > 0) {
            loadingOperations--;
        }

        if (loadingOperations === 0) {
            CoMail.Hide("Loading");
            SetLoadingModalState(false);
        }
    }

    function SetLoadingModalState(isOpen) {
        document.body.classList.toggle("loading-modal-open", isOpen);
        document.documentElement.classList.toggle("loading-modal-open", isOpen);
        var main = document.getElementById("main-content");
        if (main !== null) {
            if (isOpen) {
                main.setAttribute("aria-busy", "true");
            }
            else {
                main.removeAttribute("aria-busy");
            }
        }
    }
})(CoMail || (CoMail = {}));

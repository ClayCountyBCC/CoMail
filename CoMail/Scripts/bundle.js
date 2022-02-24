var CoMail;
(function (CoMail) {
    var LocationHash // implements ILocationHash
     = /** @class */ (function () {
        function LocationHash(locationHash) {
            this.Mailbox = "";
            this.Page = 1;
            this.EmailId = -1;
            this.Subject = "";
            this.From = "";
            var ha = locationHash.split("&");
            for (var i = 0; i < ha.length; i++) {
                var k = ha[i].split("=");
                switch (k[0].toLowerCase()) {
                    case "mailbox":
                        this.Mailbox = k[1];
                        break;
                    case "page":
                        this.Page = parseInt(k[1]);
                        break;
                    case "emailid":
                        this.EmailId = parseInt(k[1]);
                        break;
                    case "from":
                        this.From = k[1];
                        break;
                    case "subject":
                        this.Subject = k[1];
                }
            }
        }
        LocationHash.prototype.AddEmailId = function (EmailId) {
            // and using its current properties, going to emit an updated hash
            // with a new EmailId.
            var h = "";
            if (this.Mailbox.length > 0)
                h += "&mailbox=" + this.Mailbox;
            if (this.Page > -1)
                h += "&page=" + this.Page.toString();
            if (this.Subject.length > 0)
                h += "&subject=" + this.Subject;
            if (this.From.length > 0)
                h += "&from=" + this.From;
            h += "&emailid=" + EmailId.toString();
            return h.substring(1);
        };
        LocationHash.prototype.RemoveEmailId = function () {
            // and using its current properties, going to emit an updated hash
            // with a new EmailId.
            var h = "";
            if (this.Mailbox.length > 0)
                h += "&mailbox=" + this.Mailbox;
            if (this.Page > -1)
                h += "&page=" + this.Page.toString();
            if (this.Subject.length > 0)
                h += "&subject=" + this.Subject;
            if (this.From.length > 0)
                h += "&from=" + this.From;
            return h.substring(1);
        };
        return LocationHash;
    }());
    CoMail.LocationHash = LocationHash;
})(CoMail || (CoMail = {}));
//# sourceMappingURL=LocationHash.js.map
/// <reference path="typings/es6-promise/es6-promise.d.ts" />
var CoMail;
(function (CoMail) {
    var PublicMailBox = /** @class */ (function () {
        function PublicMailBox() {
        }
        PublicMailBox.prototype.Get = function () {
            var x = XHR.Get("API/MailBoxes");
            return new Promise(function (resolve, reject) {
                x.then(function (response) {
                    var ar = JSON.parse(response.Text);
                    return resolve(ar);
                }).catch(function () {
                    console.log("error in GetMailBoxes");
                    return reject(null);
                });
            });
        };
        return PublicMailBox;
    }());
    CoMail.PublicMailBox = PublicMailBox;
})(CoMail || (CoMail = {}));
//# sourceMappingURL=PublicMailBox.js.map
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
/// <reference path="typings/es6-promise/es6-promise.d.ts" />
var CoMail;
(function (CoMail) {
    var Email = /** @class */ (function () {
        function Email() {
        }
        Email.prototype.Constructor = function () {
        };
        Email.prototype.Get = function (EmailId) {
            var x = XHR.Get("API/Email/" + EmailId.toString());
            return new Promise(function (resolve, reject) {
                x.then(function (response) {
                    var ar = JSON.parse(response.Text);
                    return resolve(ar);
                }).catch(function () {
                    console.log("error in Get Email");
                    return reject(null);
                });
            });
        };
        Email.prototype.GetList = function (lh) {
            if (!this.CheckMailbox(lh.Mailbox))
                return;
            var s = lh.Subject.length === 0 ? "" : "subject=" + lh.Subject;
            var f = lh.From.length === 0 ? "" : "from=" + lh.From;
            var arg = "";
            if (s.length > 0)
                arg = "?" + s;
            if (f.length > 0)
                arg = arg.length === 0 ? "?" + f : arg + "&" + f;
            var x = XHR.Get("API/EmailList/" + lh.Mailbox + "/" + (lh.Page - 1) + "/" + arg);
            return new Promise(function (resolve, reject) {
                x.then(function (response) {
                    var ar = JSON.parse(response.Text);
                    return resolve(ar);
                }).catch(function () {
                    console.log("error in Get EmailList");
                    return reject(null);
                });
            });
        };
        Email.prototype.GetCount = function (lh) {
            if (!this.CheckMailbox(lh.Mailbox))
                return;
            var s = lh.Subject.length === 0 ? "" : "subject=" + lh.Subject;
            var f = lh.From.length === 0 ? "" : "from=" + lh.From;
            var arg = "";
            if (s.length > 0)
                arg = "&" + s;
            if (f.length > 0)
                arg = arg.length === 0 ? "&" + f : arg + "&" + f;
            var x = XHR.Get("API/EmailCount/?mailbox=" + lh.Mailbox + arg);
            return new Promise(function (resolve, reject) {
                x.then(function (response) {
                    var resp = JSON.parse(response.Text);
                    return resolve(resp);
                }).catch(function () {
                    console.log("error in Get EmailCount");
                    return reject(null);
                });
            });
        };
        Email.prototype.CheckMailbox = function (MailboxName) {
            var k = CoMail.mailboxes.filter(function (m) {
                return m.MailboxName === MailboxName;
            });
            return k.length === 1;
        };
        return Email;
    }());
    CoMail.Email = Email;
})(CoMail || (CoMail = {}));
//# sourceMappingURL=Email.js.map
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
    function BuildEmailView(e) {
        SetValue("EmailSubject", e.Subject);
        SetValue("EmailDateReceived", e.DateReceived_ToString);
        SetValue("EmailFrom", e.From);
        SetValue("EmailTo", e.To);
        SetValue("EmailCc", e.CC);
        var parser = new DOMParser();
        var d = parser.parseFromString(e.Body, "text/html");
        var EmailMessage = document.getElementById("EmailMessage");
        clearElement(EmailMessage);
        EmailMessage.appendChild(d.documentElement);
        AddAttachments(e.Attachments);
    }
    CoMail.BuildEmailView = BuildEmailView;
    function AddAttachments(attachments) {
        var EA = document.getElementById("EmailAttachments");
        clearElement(EA);
        for (var _i = 0, attachments_1 = attachments; _i < attachments_1.length; _i++) {
            var a = attachments_1[_i];
            var k = document.createElement("a");
            k.style.marginRight = "1em";
            k.href = a.URL;
            k.appendChild(document.createTextNode(a.Filename));
            EA.appendChild(k);
        }
    }
    function SetValue(id, value) {
        var e = document.getElementById(id);
        clearElement(e);
        e.appendChild(document.createTextNode(value));
    }
    function UpdateMailboxName(MailboxName) {
        var k = CoMail.mailboxes.filter(function (m) {
            return m.MailboxName === MailboxName;
        });
        var mbn = document.getElementById("MailboxName");
        clearElement(mbn);
        if (k.length === 1) {
            mbn.appendChild(document.createTextNode(k[0].Name));
        }
    }
    CoMail.UpdateMailboxName = UpdateMailboxName;
    function ClearEmailList() {
        var emailList = document.getElementById("EmailList");
        clearElement(emailList);
        return emailList;
    }
    CoMail.ClearEmailList = ClearEmailList;
    function BuildEmailList() {
        var emailList = ClearEmailList();
        var df = document.createDocumentFragment();
        for (var _i = 0, currentEmailList_1 = CoMail.currentEmailList; _i < currentEmailList_1.length; _i++) {
            var email = currentEmailList_1[_i];
            var edr = document.createElement("div");
            edr.classList.add("d-flex");
            edr.classList.add("col-12");
            edr.classList.add("flex-row");
            edr.classList.add("EmailDataRow");
            edr.classList.add("flex-wrap"); //collapse
            var daterec = CreateEmailListElement("3", email.DateReceived_ToString);
            edr.appendChild(daterec);
            var from = CreateEmailListElement("3", email.From);
            edr.appendChild(from);
            var subject = CreateEmailListElement("4", email.Subject);
            edr.appendChild(subject);
            var view = CreateEmailListElement("2", "");
            view.classList.add("CenterButton");
            var viewButton = document.createElement("a");
            viewButton.href = "#" + CoMail.currentHash.AddEmailId(email.Id);
            viewButton.classList.add("btn");
            viewButton.classList.add("btn-info");
            viewButton.classList.add("MyInfoButton");
            viewButton.appendChild(document.createTextNode("View"));
            view.appendChild(viewButton);
            edr.appendChild(view);
            df.appendChild(edr);
        }
        emailList.appendChild(df);
    }
    CoMail.BuildEmailList = BuildEmailList;
    function CreateEmailListElement(size, text) {
        var e = document.createElement("div");
        e.classList.add("col-" + size);
        e.classList.add("EmailDataCell");
        if (text.length > 0)
            e.appendChild(document.createTextNode(text));
        return e;
    }
    function BuildMailboxes() {
        var comm = document.getElementById("Commissioners");
        var former = document.getElementById("FormerCommissioners");
        var other = document.getElementById("OtherPublic");
        for (var _i = 0, _a = CoMail.mailboxes; _i < _a.length; _i++) {
            var m = _a[_i];
            if (m.Active === 0) {
                if (m.Title.indexOf("ommiss") !== -1) // they are a former commissioner
                 {
                    former.appendChild(BuildMailboxItem(m.MailboxName, m.Name, m.Title));
                }
                else // they are other than a commissioner
                 {
                    other.appendChild(BuildMailboxItem(m.MailboxName, m.Name, m.Title));
                }
            }
            else {
                comm.appendChild(BuildMailboxItem(m.MailboxName, m.Name, m.Title));
            }
        }
        document.getElementById("MailboxList").style.display = "block";
    }
    CoMail.BuildMailboxes = BuildMailboxes;
    function BuildMailboxItem(mailbox, name, title) {
        var li = document.createElement("li");
        li.classList.add("d-flex");
        li.classList.add("col-sm-6");
        li.classList.add("col-xl-4");
        li.classList.add("col-xs-12");
        var sp = document.createElement("span");
        sp.style.marginRight = "1em";
        sp.appendChild(document.createTextNode(title.replace("Commissioner of ", "").replace("Former", "")));
        li.appendChild(sp);
        var a = document.createElement("a");
        a.href = "#mailbox=" + mailbox + "&page=1";
        a.appendChild(document.createTextNode(name));
        li.appendChild(a);
        return li;
    }
    CoMail.BuildMailboxItem = BuildMailboxItem;
    function clearElement(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }
    CoMail.clearElement = clearElement;
    function Show(id) {
        var e = document.getElementById(id);
        e.style.display = "block";
    }
    CoMail.Show = Show;
    function Hide(id) {
        var e = document.getElementById(id);
        e.style.display = "none";
    }
    CoMail.Hide = Hide;
})(CoMail || (CoMail = {}));
//# sourceMappingURL=UI.js.map
/// <reference path="locationhash.ts" />
/// <reference path="xhr.ts" />
/// <reference path="ui.ts" />
/// <reference path="typings/es6-promise/es6-promise.d.ts" />
var CoMail;
(function (CoMail) {
    CoMail.mailboxes = [];
    CoMail.currentEmailList = [];
    CoMail.currentHash = null;
    function Start() {
        window.onhashchange = HashChange;
        // let's check the current hash to make sure we don't need to start on a given mailbox / page / email
        GetMailBoxes();
    }
    CoMail.Start = Start;
    function ModalClosed(evt) {
        location.hash = CoMail.currentHash.RemoveEmailId();
        var emailMessage = document.getElementById("EmailMessage");
        CoMail.clearElement(emailMessage);
    }
    CoMail.ModalClosed = ModalClosed;
    function HashChange() {
        HandleHash();
    }
    CoMail.HashChange = HashChange;
    function HandleHash() {
        var hash = location.hash;
        var oldHash = CoMail.currentHash;
        CoMail.currentHash = new CoMail.LocationHash(location.hash.substring(1));
        ShowMenu(CoMail.currentHash, oldHash);
    }
    function ShowMenu(lh, oh) {
        if (lh.Mailbox.length === 0) {
            CoMail.Show("MailboxList");
            CoMail.ClearEmailList();
            CoMail.Hide("MailboxView");
        }
        else {
            if (oh === null || oh.Mailbox !== lh.Mailbox || oh.Page !== lh.Page) {
                CoMail.UpdateMailboxName(lh.Mailbox);
                GetEmailList(CoMail.currentHash);
                GetEmailCount(CoMail.currentHash);
            }
            CoMail.Hide("MailboxList");
            CoMail.Show("MailboxView");
        }
        if (lh.EmailId > -1) {
            GetEmail(lh.EmailId);
        }
    }
    function GetEmail(EmailId) {
        CoMail.Show("Loading");
        var email = new CoMail.Email();
        email.Get(EmailId)
            .then(function (mail) {
            CoMail.BuildEmailView(mail);
            $('#EmailView').modal('show');
            CoMail.Hide("Loading");
        }, function () {
            console.log('error getting Email');
            CoMail.Hide("EmailLoading");
        });
    }
    function GetEmailList(lh) {
        CoMail.Show("Loading");
        var EmailList = document.getElementById("EmailList");
        CoMail.clearElement(EmailList);
        var email = new CoMail.Email();
        email.GetList(lh)
            .then(function (allmail) {
            CoMail.currentEmailList = allmail;
            CoMail.BuildEmailList();
            CoMail.Hide("Loading");
        }, function () {
            console.log('error getting Email List');
            CoMail.Hide("Loading");
        });
    }
    function GetEmailCount(lh) {
        var email = new CoMail.Email();
        email.GetCount(lh)
            .then(function (emailCount) {
            CoMail.currentEmailCount = emailCount;
            console.log('current email count', CoMail.currentEmailCount);
            BuildPaging();
        }, function () {
            console.log('error getting Email Count');
        });
    }
    function BuildPaging() {
        // first let's update the totalpagecount
        var tpc = document.getElementById("TotalPageCount");
        CoMail.clearElement(tpc);
        var max = Math.max(Math.floor(CoMail.currentEmailCount / 20), 1);
        tpc.appendChild(document.createTextNode("Page " + CoMail.currentHash.Page + " of " + max));
        var prev = document.getElementById("PreviousPage");
        prev.href = location.hash;
        UpdatePage(prev, CoMail.currentHash.Page - 1, max);
        var next = document.getElementById("NextPage");
        UpdatePage(next, CoMail.currentHash.Page + 1, max);
    }
    function UpdatePage(a, page, max) {
        a.href = location.hash;
        if (page < max && page > 0) {
            if (a.href.indexOf("page=") > -1) {
                a.href = a.href.replace("page=" + CoMail.currentHash.Page, "page=" + page);
            }
            else {
                a.href += "&page=" + page;
            }
        }
    }
    function GetMailBoxes() {
        var mb = new CoMail.PublicMailBox();
        mb.Get()
            .then(function (all) {
            CoMail.mailboxes = all;
            CoMail.BuildMailboxes();
            CoMail.Hide("Loading");
            if (location.hash.substring(1).length > 0)
                HandleHash();
        }, function () {
            console.log('error getting All Mailboxes');
        });
    }
})(CoMail || (CoMail = {}));
//# sourceMappingURL=app.js.map
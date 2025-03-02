// ==UserScript==
// @name         Enhanced ECUST
// @namespace    https://bbs.tampermonkey.net.cn/
// @version      0.0.1
// @description  Make ECUST easier
// @author       Oborozuki
// @match        https://*.ecust.edu.cn/*
// @grant        unsafeWindow
// @run-at       document-body
// @downloadURL  https://github.com/oborozuk/Enhanced-ECUST/raw/refs/heads/main/Enhanced%20ECUST.user.js
// @updateURL    https://github.com/oborozuk/Enhanced-ECUST/raw/refs/heads/main/Enhanced%20ECUST.user.js
// ==/UserScript==

'use strict';

(function () {
    if (!window.location.href.includes('sslvpn.ecust.edu.cn') && window === window.top) {
        // 添加跳转 VPN 按钮
        addVPNButton();
    }

    if (matchURL('jwc.ecust.edu.cn') && window === window.top) {
        /* 教务处信息网 */
        // 添加 pdf 下载按钮
        const style = document.createElement('style');
        style.textContent = `
            .pdf-download-button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 8px 16px;
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: bold;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
                border: none;
                cursor: pointer;
                text-align: center;
            }
            
            .pdf-download-button:hover {
                background: linear-gradient(135deg, #0056b3, #003d82);
                font-size: 14px;
                transform: scale(1.05);
                color: white;
            }
        `;
        document.head.appendChild(style);
        document.querySelectorAll('.wp_pdf_player').forEach(dom => {
            const pdfURL = dom.getAttribute('pdfsrc');
            const fileAttr = JSON.parse(dom.getAttribute('sudyfile-attr').replaceAll("'", '"'));
            const pdfName = fileAttr.title ? fileAttr.title : '';
            const button = document.createElement('a');
            button.href = pdfURL;
            button.textContent = '📄 下载 PDF';
            button.classList.add('pdf-download-button');
            button.setAttribute('download', pdfName);

            const p = document.createElement('p');
            p.style.textAlign = 'center';
            p.style.margin = '15px 0';
            p.appendChild(button);

            dom.parentNode.insertBefore(p, dom);
        });


    } else if (matchURL('i.s.ecust.edu.cn/space/index') && window === window.top) {
        /* 华东理工大学本研 */
        // 不提醒推荐浏览器
        elementGetter('a.zbrowser_close').then(dom => dom.click());
    }


    if (matchURL('sso.ecust.edu.cn/authserver/login')) {
        /* 统一身份认证 */
        // 自动点击一周内免登录
        elementGetter('.iCheck-helper').then(dom => dom.click());
    } else if (matchURL('sslvpn.ecust.edu.cn/portal/#!/service')) {
        /* 华东理工大学 VPN 导航 */
        // 删除遮罩
        elementGetter('div.dialog-mask').then(dom => dom.remove());

    } else if (matchURL('inquiry.ecust.edu.cn/jsxsd/xspj/')) {
        /* 教学评价 */
        // TODO: 打分
    } else if (matchURL('inquiry.ecust.edu.cn/jsxsd/kscj/cjcx_query')) {
        /* 课程成绩查询 */
        // 自动设置学期
        /* eslint-disable no-undef */
        const options = $('#kksj option').map((_, e) => e.value).get();
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const semester = (currentMonth >= 3 && currentMonth <= 8) ? '2' : '1';
        const startYear = (currentMonth <= 8) ? currentYear - 1 : currentYear;
        const currentSemester = `${startYear}-${startYear + 1}-${semester}`;
        $('#kksj').val(options.includes(currentSemester) ? currentSemester : options.pop());
        /* eslint-enable no-undef */

    } else if (matchURL('workflow.ecust.edu.cn/default/work/uust/xsjqxctb/xsjqxctb.jsp')) {
        /* 学生假期行程填报 */
        // 关闭填报安全须知
        const informDialogInterval = setInterval(() => {
            /* eslint-disable no-undef */
            const modal = $('.prompt_box_modal');
            if (modal.find('h4').text() === '填报安全须知') {
                modal.modal('hide');
                clearInterval(informDialogInterval);
            }
            /* eslint-enable no-undef */
        }, 200);
        // TODO: 不写行程

    } else if (matchURL('mooc.s.ecust.edu.cn/coursedata/batchDownload')) {  // 
        /* 华东理工大学本研 批量下载 */
        // 替换批量复制 Flash
        unsafeWindow.copyAllLinks = () => {
            navigator.clipboard.writeText(document.querySelector('#url').innerText);
            document.querySelector('#copyAllLinks > span').innerText = '复制成功';
        };
    }

})();

function elementGetter(selector, delayPerMs = 500, maxDelayMs = 10000) {
    const { promise, resolve, reject } = Promise.withResolvers();
    let count = 0;
    const getterTimer = setInterval(() => {
        const dom = document.querySelector(selector);
        if (dom) {
            clearInterval(getterTimer);
            resolve(dom);
        }
        count += delayPerMs;
        if (count > maxDelayMs) {
            reject();
        }
    }, delayPerMs);
    return promise;
}

function convertToVPN(url) {
    return url.replace(/((?:([^/.]+\.))+[^/.]+)/,
        (_, domain) => `${domain.split('.').join('-')}-s.sslvpn.ecust.edu.cn:8118`);
}

function matchURL(url) {
    const href = window.location.href;
    return href.includes(url) || convertToVPN(href).includes(url);
}

function addVPNButton() {
    const container = Object.assign(document.createElement('div'), {
        className: 'vpn-button-container',
    });

    const btn = Object.assign(document.createElement('button'), {
        className: 'vpn-button',
        textContent: '跳转 VPN',
        type: 'button'
    });

    const style = document.createElement('style');
    style.textContent = `
        .vpn-button-container {
            position: fixed;
            bottom: 20px;
            right: 0px;
            z-index: 10000;
            transition: right 0.3s ease-in-out;
        }

        .vpn-button {
            width: 80px;
            height: 40px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 10px 0 0 10px;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
            opacity: 0.6;
            transform: translateX(50px);
            transition: 0.3s;
        }

        .vpn-button:hover {
            opacity: 1;
            transform: translateX(0);
        }
    `;

    btn.addEventListener('click', () => window.location.href = convertToVPN(window.location.href));

    container.appendChild(btn);
    document.head.appendChild(style);
    document.body.appendChild(container);
}

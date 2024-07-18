// 异步导入JSON文件
async function loadTranslations() {
    const responseZhCn = await fetch('./lang/zh_cn.json');
    const responseEn = await fetch('./lang/en.json');
    const responseZhTw = await fetch('./lang/zh_tw.json');

    const zh_cn = await responseZhCn.json();
    const en = await responseEn.json();
    const zh_tw = await responseZhTw.json();


    return {
        'zh_CN': { translation: zh_cn },
        'en': { translation: en },
        'zh_TW': { translation: zh_tw } 
    };
}

// 初始化i18next
async function initI18next() {
    const resources = await loadTranslations();
    // console.log(resources)

    i18next.init({
        lng: 'zh_CN', // 设置默认语言
        debug: true, // 开启调试模式
        resources
    }, (err, t) => {
        if (err) return console.error('Failed to initialize i18next', err);
        //   translatePage();
    });
}

// 页面翻译函数
function translatePage() {
    document.querySelectorAll('[id]').forEach(element => {
        const key = element.id;
        // const translation = i18next.exists(key) ? i18next.t(key) : element.textContent; // 检查key是否存在，存在则翻译，否则保留原文
        if (i18next.exists(key)){

            element.textContent = i18next.t(key);
        }
    });
}

// 语言切换函数
function switchLanguage(lang) {
    i18next.changeLanguage(lang, (err, t) => {
        if (err) return console.error('Failed to change language', err);
        translatePage();
        document.documentElement.lang = lang;
    });
}

// 初始化
initI18next().catch(err => console.error('Initialization failed', err));

// 语言切换
// document.getElementById('language').addEventListener('change', function(event) {
//     let selectedLang = event.target.value;
//     switchLanguage(selectedLang);
// });

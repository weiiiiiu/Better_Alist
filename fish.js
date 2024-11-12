/*
用于文件目录美化以及背景图
*/

body {
    background-image: url('http://api.hancat.work/cloud/api.php'); /* 将此处替换为你自己的背景图api地址 */
    background-repeat: no-repeat;
    background-size: cover;
    background-attachment: fixed;
}

@keyframes gradientBG {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}

.fish-container {
    margin: 0;
    padding: 0;
    background-color: transparent;
    width: 100%;
    height: 200px;
    z-index: -1;
    position: fixed;
    bottom: 0;
    left: 0;
    opacity: 0.5;
}

.hope-c-PJLV-igScBhH-css {
    background-color: rgba(255, 255, 255, 0.8) !important;
    justify-content: center;
}

.hope-c-PJLV-ijgzmFG-css {
    opacity: 0.8 !important;
    justify-content: center;
    backdrop-filter: blur(5px);
}

.hope-c-PJLV-iigjoxS-css,
.hope-c-PJLV-ikEIIxw-css,
.hope-c-PJLV-iiuDLME-css,
.hope-c-PJLV-ikSuVsl-css {
    opacity: 0.7;
    justify-content: center;
    backdrop-filter: blur(5px);
}

.hope-c-PJLV-ikaMhsQ-css {
    --hope-colors-background: #ffffff00;
}

.hope-c-PJLV-idaeksS-css {
    opacity: 0.6;
    backdrop-filter: blur(10px);
    border-radius: 7px;
}

.hope-c-PJLV-ifiEvmt-css {
    opacity: 0.7;
    backdrop-filter: blur(8px);
}

.hope-c-PJLV-iSMXDf-css {
    opacity: 0.9;
}

.sw-Hennnyano {
    width: 224px;
    height: 224px;
    position: fixed;
    left: 0;
    z-index: 100;
    pointer-events: auto !important;
    -webkit-transition: bottom 1.3s cubic-bezier(0, 2.06, 0.56, 0.78);
    transition: bottom 1.3s cubic-bezier(0, 2.06, 0.56, 0.78);
    bottom: -230px;
}

@media print, screen and (max-width: 1024px) {
    .sw-Hennnyano {
        width: 25.26042vw;
        height: 25.26042vw;
        bottom: -25.26042vw;
    }
}

.sw-Hennnyano.show {
    bottom: -60px;
}

@media print, screen and (max-width: 1024px) {
    .sw-Hennnyano.show {
        bottom: -6.25vw;
    }
}

.sw-Hennnyano .body,
.sw-Hennnyano .eyes {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
    background-position: left bottom;
    background-size: contain;
    background-repeat: no-repeat;
}

.sw-Hennnyano .body {
    background-image: url(https://cdn.jsdelivr.net/gh/TheSmallHanCat/Better_Alist@main/img/img_hennyano_body.png);
}

.sw-Hennnyano .eyes {
    background-image: url(https://cdn.jsdelivr.net/gh/TheSmallHanCat/Better_Alist@main/img/img_hennyano_eyes.png);
}

@media (any-hover: hover) {
    .sw-Hennnyano:hover {
        cursor: pointer !important;
    }
}

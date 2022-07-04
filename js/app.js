import gsap from 'gsap';
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";
import LocomotiveScroll from 'locomotive-scroll';
import Scene from './scene.js';
import Cursor from './cursor';
import workHover from './workItem';
import barba from '@barba/core';

gsap.registerPlugin(SplitText);
gsap.registerPlugin(ScrollTrigger);

const overlayPath = document.querySelector('.overlay__path');
const cursor = new Cursor(document.querySelector('.cursor'));

[...document.querySelectorAll('a')].forEach(link => {
    link.addEventListener('mouseenter', () => cursor.enter());
    link.addEventListener('mouseleave', () => cursor.leave());
});

let loco;
let blob;

function initScroll(container){

    loco = new LocomotiveScroll({
        el: container.querySelector('[data-scroll-container]'),
        smooth: true,
        smoothMobile: true,
        getDirection: true
    });

    loco.on("scroll", ScrollTrigger.update);

    ScrollTrigger.scrollerProxy('[data-scroll-container]', {

        scrollTop(value) {
          return arguments.length ? loco.scrollTo(value, 0, 0) : loco.scroll.instance.scroll.y;
        }, 
        getBoundingClientRect() {
            return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
        },
        pinType: container.querySelector('[data-scroll-container]').style.transform ? "transform" : "fixed"

    });
    ScrollTrigger.addEventListener('refresh', () => loco.update());
    ScrollTrigger.refresh();
}

function delay(n) {
    n = n || 2000;
    return new Promise((done) => {
        setTimeout(() => {
            done();
        }, n);
    });
}

function theBlob(container){

    console.log(container)

    blob = new Scene({
        domElement: container.querySelector('#gl-stuff')
    });
    let animMesh = blob.mesh;

    gsap.set(blob.camera.position, {
        x: 2,
        z: 1
    });

    let glTl = gsap.timeline({
        clearProps: true,
        scrollTrigger: {
            trigger: '.about',
            start: "top 60%",
            scroller: ".scroller",
            scrub: 2
        }
    });
    

    glTl.to(animMesh.rotation, {
        x: 0.5,
        y: -1
    });

    glTl.to(blob.camera.position, {
        x: 4,
        z: 4
    }, '-= 1');
}

function home(){

    //new workHover();

    let textSplit = new SplitText('.text-split', {type: "lines, words"});
    let introSplit = new SplitText('.intro-title', {type: "lines, words"});
    let wavyText = textSplit.words;
    let introText = introSplit.words;
    let workItem = document.querySelectorAll(".work__item");
    let introTl = gsap.timeline({paused: true, delay: 1.0});

    introText.forEach(word => {

        introTl.from(word, {
            opacity: 0,
            y: 150,
            duration: 0.5,
            delay: 0.2,
            stagger: 0.05,
            ease: "power3"
        })

    });

    wavyText.forEach(word => {

        gsap.from(word, {
            opacity: 0,
            y: 150,
            stagger: 0.5,
            ease: "power3",
            scrollTrigger: {
                trigger: word,
                start: "top 60%",
                scroller: ".scroller"
            }
        })
    });


    workItem.forEach(item => {

        let line = item.querySelectorAll('.line');
        let client = item.querySelectorAll('.client')
        let workSplit = new SplitText(client, {type: "lines, words"});
        let workText = workSplit.lines;
        let workTl = gsap.timeline({
            clearProps: true,
            stagger: 0.5,
            ease: "power3",
            scrollTrigger: {
                trigger: item,
                start: "top 60%",
                scroller: ".scroller"
            }
        });

        workTl.to(line, {
            scaleX: 1.0,
            duration: 1.0
        })
        workTl.from(workText, {
            opacity: 0,
            y: 150
        }, '-= 0.5')
    });

    introTl.play();
}


function pageTransitionIn({container}) {
    return gsap.timeline()
        .set(overlayPath, { 
            attr: { d: 'M 0 100 V 0 Q 50 0 100 0 V 100 z' }
        })
        .to(overlayPath, { 
            duration: 0.3,
            ease: 'power2.in',
            attr: { d: 'M 0 100 V 50 Q 50 100 100 50 V 100 z' }
        })
        .to(overlayPath, { 
            duration: 0.8,
            ease: 'power4',
            attr: { d: 'M 0 100 V 100 Q 50 100 100 100 V 100 z' }
        })
        .from(container, {
            opacity: 0
        })
}

function pageTransitionOut({container}) {
    return gsap.timeline()
        .to(container, {
            opacity: 0,
            duration: 0.5
        })
        .set(overlayPath, {
            attr: { d: 'M 0 0 V 0 Q 50 0 100 0 V 0 z' }
        })
        .to(overlayPath, { 
            duration: 0.8,
            ease: 'power4.in',
            attr: { d: 'M 0 0 V 50 Q 50 100 100 50 V 0 z' }
        }, 0)
        .to(overlayPath, { 
            duration: 0.3,
            ease: 'power2',
            attr: { d: 'M 0 0 V 100 Q 50 100 100 100 V 0 z' }
        })
}


barba.init({
    debug: true,
    sync:true,
    views: [{
        namespace: 'home',
        beforeEnter(data) {
            home();
            theBlob(data.next.container);
        }
    }],
    transitions: [{
        name: 'overlay-transition',
            async once(data) {
                initScroll(data.next.container);
                home();
                theBlob(data.next.container);
            },
            async leave(data) {
                //pageTransitionIn(data.current);
                data.current.container.remove();
            },
            async beforeEnter(data) {
                ScrollTrigger.getAll().forEach(tl => tl.kill());
                loco.destroy();
                initScroll(data.next.container);
            },
            async enter(data) {
                window.scrollTo(0, 0);
                //pageTransitionOut(data.next);
            }
    }]
});

window.addEventListener("load", () => {
    home();
});
import gsap from 'gsap';
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";
import ASScroll from '@ashthornton/asscroll';
import Scene from './scene.js';
import Cursor from './cursor';
import workHover from './workItem';
import barba from '@barba/core';

gsap.registerPlugin(SplitText);
gsap.registerPlugin(ScrollTrigger);

const asscroll = setupASScroll();
const overlayPath = document.querySelector('.overlay__path');
const cursor = new Cursor(document.querySelector('.cursor'));

[...document.querySelectorAll('a')].forEach(link => {
    link.addEventListener('mouseenter', () => cursor.enter());
    link.addEventListener('mouseleave', () => cursor.leave());
});


function setupASScroll(){
    
    let asscroll = new ASScroll({
        disableRaf: true,
        scrollElements: document.querySelectorAll(".gsap-marker-start, .gsap-marker-end, [asscroll]")
    });


    gsap.ticker.add(asscroll.update);

    ScrollTrigger.defaults({
        scroller: asscroll.containerElement
    });

    ScrollTrigger.scrollerProxy(asscroll.containerElement, {
        scrollTop(value) {
            if (arguments.length) {
                asscroll.currentPos = value;
                return;
            }
            return asscroll.currentPos;
        },
        getBoundingClientRect() {
            return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
        },
        fixedMarkers: true
    });

    asscroll.on("update", ScrollTrigger.update);
    ScrollTrigger.addEventListener("refresh", asscroll.resize);
    
    requestAnimationFrame(() => {
       asscroll.enable({
            newScrollElements: document.querySelectorAll(".gsap-marker-start, .gsap-marker-end, [asscroll]")
        }); 
    });
    return asscroll;
};

function home(){

    let crazyStuff = new Scene({
        domElement: document.getElementById('gl-stuff')
    });

    new workHover();

    let textSplit = new SplitText('.text-split', {type: "lines, words"});
    let introSplit = new SplitText('.intro-title', {type: "lines, words"});

    let wavyText = textSplit.words;
    let introText = introSplit.words;

    let workItem = document.querySelectorAll(".work__item");
    let animMesh = crazyStuff.mesh;
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
            }
        })
    });


    workItem.forEach(item => {

        line = item.querySelectorAll('.line');
        client = item.querySelectorAll('.client')
        workSplit = new SplitText(client, {type: "lines, words"});
        workText = workSplit.lines;
        workTl = gsap.timeline({
            clearProps: true,
            stagger: 0.5,
            ease: "power3",
            scrollTrigger: {
                trigger: item,
                start: "top 60%",
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


    glTl = gsap.timeline({
        clearProps: true,
        scrollTrigger: {
            trigger: '.about',
            start: "top 60%",
            scrub: 2
        }
    });
    

    glTl.to(animMesh.rotation, {
        x: 0.5,
        y: -1
    });

    glTl.to(crazyStuff.camera.position, {
        x: 4,
        z: 4
    }, '-= 1');

    introTl.play();
}


window.addEventListener("load", () => {
    //asscroll.enable();
});


barba.init({
    views: [{
        namespace: 'home',
        beforeEnter() {
            home();
            Scene.cameraReset();
        }
    },
    {
        namespace: 'about',
        beforeEnter() {
            console.log('aboutwat?');
        }
    }],
    transitions: [{
        name: 'from-home',
        from: {
            namespace: ["home"]
        },
        leave(data) {

            asscroll.disable();

            return gsap.timeline()
            .to(data.current.container,{
                opacity: 0.,
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
        },
        enter(data) {
            asscroll = new ASScroll({
                disableRaf: true,
                containerElement: data.next.container.querySelector("[asscroll-container]")
            })
            asscroll.enable({
                newScrollElements: data.next.container.querySelector('.scroll-wrap')
            })
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
            .from(data.next.container,{
                opacity: 0.,
                onComplete: ()=>{
                    data.current.container.style.visibility = "hidden";
                }
            })
        }
    },
    {
        name: 'from-about',
        from: {
            namespace: ["about"]
        },
        leave(data) {
            asscroll.disable();
            return gsap.timeline()
            .to(data.current.container,{
                opacity: 0.,
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
        },
        enter(data) {
            
            let asscroll = new ASScroll({
                disableRaf: true,
                containerElement: data.next.container.querySelector("[asscroll-container]")
            })
            asscroll.enable({
                newScrollElements: data.next.container.querySelector('.scroll-wrap')
            })
            home();
            asscroll.update()
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
            .from(data.next.container,{
                opacity: 0.,
                onComplete: ()=>{
                    data.current.container.style.visibility = "hidden";
                }
            })
        }
    }]
});

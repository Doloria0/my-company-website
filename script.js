// GSAP & Firebase (Compat v8) Integrated Script

// ==========================================
// [파이어베이스(Firebase) 연동 설정]
// 사람들이 글을 남겨도 영구히 저장되도록 하려면 아래의 빈칸을 채워주세요!
// Firebase Console -> 프로젝트 생성 -> 웹 앱 추가 후 아래 SDK 설정 값을 그대로 복사 붙여넣기 하시면 됩니다.
// ==========================================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

let db;
let isFirebaseReal = false;
// 파이어베이스가 연결되기 전에는 브라우저 내부 로컬스토리지에 안전하게 임시 저장됩니다.
window.localPosts = JSON.parse(localStorage.getItem('sim_posts')) || [
    { id: "admin-1", author: "Admin", password: "admin", content: "휴림로봇 커뮤니티에 오신 것을 환영합니다! 비밀번호 'admin' 또는 '1234'로 관리해보세요.", createdAt: { seconds: Date.now()/1000 } }
];

try {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.apiKey.trim() !== "") {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        isFirebaseReal = true;
        console.log("Firebase Firestore가 성공적으로 연동되었습니다! 모든 게시글이 클라우드에 안전하게 영구 저장됩니다.");
    } else {
        console.log("Firebase 설정이 비어 있어 '로컬 시뮬레이션 모드(LocalStorage)'로 동작합니다. 글을 영구 보존하려면 script.js 상단에 Firebase Key를 입력하세요.");
    }
} catch (e) {
    console.error("Firebase 초기화 중 에러가 발생하여 로컬 모드로 전환합니다:", e);
}

// Global actions for onclick access
window.handlePostAction = async (id, action) => {
    const ADMIN_PW = "1234";
    let inputPassword = prompt("비밀번호를 입력하세요:");
    if (inputPassword === null) return;
    inputPassword = inputPassword.trim();

    if (isFirebaseReal) {
        try {
            const docRef = db.collection("posts").doc(id);
            const doc = await docRef.get();
            if (doc.exists) {
                const data = doc.data();
                if (inputPassword === ADMIN_PW || (data.password && data.password.trim() === inputPassword)) {
                    if (action === 'delete') {
                        if (confirm("정말로 삭제하시겠습니까?")) {
                            await docRef.delete();
                            alert("삭제가 완료되었습니다.");
                        }
                    } else if (action === 'edit') {
                        const newContent = prompt("수정할 내용을 입력하세요:", data.content);
                        if (newContent !== null) {
                            await docRef.update({ content: newContent });
                            alert("수정이 완료되었습니다.");
                        }
                    }
                } else {
                    alert("비밀번호가 틀렸습니다.");
                }
            }
        } catch (err) { alert("오류 발생: " + err.message); }
    } else {
        const index = window.localPosts.findIndex(p => p.id === String(id));
        if (index !== -1) {
            const post = window.localPosts[index];
            if (inputPassword === ADMIN_PW || (post.password && post.password.trim() === inputPassword)) {
                if (action === 'delete') {
                    if (confirm("정말로 삭제하시겠습니까?")) {
                        window.localPosts.splice(index, 1);
                        saveAndRenderLocal();
                        alert("게시물이 삭제되었습니다.");
                    }
                } else if (action === 'edit') {
                    const newContent = prompt("수정할 내용을 입력하세요:", post.content);
                    if (newContent !== null) {
                        window.localPosts[index].content = newContent;
                        saveAndRenderLocal();
                        alert("게시물이 수정되었습니다.");
                    }
                }
            } else {
                alert("비밀번호가 틀렸습니다.");
            }
        }
    }
};

function saveAndRenderLocal() {
    localStorage.setItem('sim_posts', JSON.stringify(window.localPosts));
    if (window.refreshPosts) window.refreshPosts();
}

/* --- Inquiry Modal Controls --- */
function openModal() {
    const modal = document.getElementById('inquiryModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scroll
}

function closeModal() {
    const modal = document.getElementById('inquiryModal');
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scroll
}

// Close modal when clicking outside content
window.onclick = function(event) {
    const modal = document.getElementById('inquiryModal');
    if (event.target == modal) {
        closeModal();
    }
}

function handleInquiry(event) {
    event.preventDefault();
    const name = document.getElementById('inquiryName').value;
    const email = document.getElementById('inquiryEmail').value;
    
    // Simulate sending
    const btn = event.target.querySelector('button');
    const originalText = btn.innerText;
    btn.innerText = '전송 중...';
    btn.disabled = true;

    setTimeout(() => {
        alert(`${name}님, 문의가 정상적으로 접수되었습니다.\n등록하신 이메일(${email})로 곧 답변드리겠습니다.`);
        btn.innerText = originalText;
        btn.disabled = false;
        event.target.reset();
        closeModal();
    }, 1500);
}

// GSAP Animations Re-enabled for smoother reveal
document.addEventListener('DOMContentLoaded', () => {
    gsap.from('.logo', { y: -20, opacity: 0, duration: 1, ease: 'power3.out' });
    gsap.from('nav ul li', { y: -20, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out' });

    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        window.addEventListener('scroll', () => {
            const header = document.querySelector('header');
            if (window.scrollY > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        });
        gsap.to(".scroll-progress", { width: "100%", ease: "none", scrollTrigger: { scrub: 0.3 } });
        gsap.from(".hero-title", { y: 50, opacity: 0, duration: 1.2, delay: 0.5 });
        /* 
        // Stagger Reveals - Disabled for immediate visibility
        const revealSections = document.querySelectorAll(".section");
        revealSections.forEach(section => {
            const animElements = section.querySelectorAll(".section-tag, .section-title, .product-card, .ceo-image-container, .ceo-content, .community-container");
            if (animElements.length > 0) {
                gsap.from(animElements, {
                    scrollTrigger: {
                        trigger: section,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    },
                    y: 40,
                    opacity: 0,
                    stagger: 0.15,
                    duration: 1,
                    ease: "power2.out"
                });
            }
        });
        */
    }

    const postForm = document.getElementById('community-form');
    const postList = document.getElementById('community-posts');
    const authorInput = document.getElementById('post-author');
    const passwordInput = document.getElementById('post-password');
    const contentInput = document.getElementById('post-content');

    window.refreshPosts = () => {
        if (!postList) return;
        postList.innerHTML = '';
        const postsToRender = isFirebaseReal ? [] : window.localPosts;
        
        if (!isFirebaseReal) {
            const sorted = [...postsToRender].sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
            sorted.forEach(renderSinglePost);
        }
    };

    function renderSinglePost(post) {
        const dateStr = new Date(post.createdAt.seconds * 1000).toLocaleString();
        const div = document.createElement('div');
        div.className = 'post-item glass';
        div.innerHTML = `
            <div class="post-header">
                <span>${post.author}</span>
                <span>${dateStr}</span>
            </div>
            <p>${post.content}</p>
            <div class="post-actions" style="margin-top: 1rem; display: flex; gap: 1rem; font-size: 0.75rem;">
                <a href="javascript:void(0)" onclick="handlePostAction('${post.id}', 'edit')" style="color: var(--accent); text-decoration: none;">수정</a>
                <a href="javascript:void(0)" onclick="handlePostAction('${post.id}', 'delete')" style="color: #ff453a; text-decoration: none;">삭제</a>
            </div>
        `;
        postList.appendChild(div);
    }

    if (isFirebaseReal) {
        db.collection("posts").orderBy("createdAt", "desc").onSnapshot(snapshot => {
            postList.innerHTML = '';
            snapshot.docs.forEach(doc => renderSinglePost({ id: doc.id, ...doc.data() }));
        });
    } else {
        window.refreshPosts();
    }

    if (postForm) {
        postForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const author = authorInput.value.trim();
            const password = passwordInput.value.trim();
            const content = contentInput.value.trim();

            if (!author || !password || !content) return;

            if (isFirebaseReal) {
                db.collection("posts").add({
                    author, password, content,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => postForm.reset());
            } else {
                const newPost = { 
                    id: Date.now().toString(),
                    author, password, content, 
                    createdAt: { seconds: Date.now()/1000 } 
                };
                window.localPosts.push(newPost);
                saveAndRenderLocal();
                postForm.reset();
                alert("게시글이 등록되었습니다!");
            }
        });
    }
});

# 🫛 with-them 🫘

![HTML](https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![EJS](https://img.shields.io/badge/EJS-3C873A?style=for-the-badge&logo=ejs&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Passport](https://img.shields.io/badge/Passport-34E27A?style=for-the-badge&logo=passport&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-FF7F50?style=for-the-badge&logo=multipass&logoColor=white)

## 🎉 프로젝트 개요

### 🎯 목표
이 프로젝트의 목표는 사용자가 다양한 상품을 경매할 수 있는 웹 애플리케이션을 개발하는 것입니다. 사용자들은 상품을 등록하고, 입찰하고, 경매가 끝난 후에 상품을 구매할 수 있습니다. 또한 사용자들은 게시판에 글을 작성하고, 댓글을 달 수 있습니다.

### 🛠 기술스택
- **프론트엔드**: HTML, CSS, JavaScript, EJS (템플릿 엔진)
- **백엔드**: Node.js, Express.js
- **데이터베이스**: MongoDB
- **인증 및 권한 관리**: Passport.js, bcrypt
- **파일 업로드**: Multer, AWS S3
- **기타**: Session 관리, S3Client, Express-session

## 🌟 주요 기능

### 🔒 사용자 인증 및 권한 관리
- **회원가입**: 새로운 사용자 등록, 비밀번호 해싱 및 중복 확인
- **로그인/로그아웃**: LocalStrategy를 이용한 세션 기반 인증, 사용자 세션 관리
- **권한 관리**: 로그인 여부를 확인하여 특정 페이지 접근 제한

### 💼 상품 경매
- **상품 등록**: 카테고리, 설명, 이미지 업로드 등을 포함한 상품 등록 기능
- **상품 입찰**: 현재 입찰가보다 높은 금액으로 입찰할 수 있으며, 입찰 성공 시 포인트 차감 및 이전 최고 입찰자에게 포인트 반환
- **상품 조회**: 모든 상품 및 카테고리별 상품 조회 기능
- **상품 상세**: 개별 상품의 상세 정보 조회 및 입찰 기능

### 📝 게시판 기능
- **게시글 작성**: 게시판에 제목, 내용, 이미지를 포함한 글 작성 기능
- **게시글 조회**: 게시글 리스트 및 페이지네이션 기능
- **게시글 검색**: 제목, 내용, 작성자 기반 검색 기능
- **댓글 작성**: 게시글에 댓글 작성 기능
- **게시글 삭제**: 사용자가 작성한 게시글 삭제 기능

### 👤 사용자 마이페이지
- **내 상품 관리**: 사용자가 등록한 상품, 입찰한 상품, 낙찰된 상품 관리 기능
- **내 포인트 확인**: 현재 사용자 포인트 확인 기능

## 📸 스크린샷

### 🌐 메인 화면
![Main Screen](./public/images/git-main.png)

### 🔍 디테일 화면
![Weather Modal](./public/images/git-detail.png)


## 🛠 개발과정 흐름

1. **초기 설계 및 기술 선정**:
   - 프로젝트 목표와 요구사항 정의
   - 기술 스택 선정 (Node.js, Express.js, MongoDB, Passport.js, AWS S3 등)

2. **프로젝트 설정 및 기본 구조 작성**:
   - Express.js를 이용한 서버 설정
   - EJS를 사용한 템플릿 엔진 설정
   - MongoDB 연결 및 데이터베이스 초기 설정

3. **사용자 인증 및 권한 관리 구현**:
   - Passport.js를 이용한 회원가입, 로그인 및 세션 관리
   - bcrypt를 이용한 비밀번호 해싱 및 검증

4. **상품 경매 기능 구현**:
   - 상품 등록 페이지 및 로직 작성
   - AWS S3를 이용한 이미지 업로드 및 관리
   - 입찰 로직 구현 및 포인트 관리

5. **게시판 기능 구현**:
   - 게시글 작성, 조회, 검색 기능 구현
   - 댓글 작성 기능 추가

6. **마이페이지 기능 구현**:
   - 사용자 정보 및 상품 관리 기능 구현
   - 입찰 내역 및 낙찰 상품 조회 기능 추가

7. **프론트엔드 UI 및 UX 개선**:
   - EJS 템플릿을 이용한 프론트엔드 페이지 작성
   - 사용자 경험을 고려한 UI 디자인 및 개선

8. **테스트**:
   - 기능 테스트 및 디버깅

## ⚠️ 어려웠던 부분과 해결 과정

1. **사용자 인증 및 세션 관리**:
   - **문제**: Passport.js와 Express-session을 이용한 사용자 인증 및 세션 관리를 구현하는 과정에서 세션이 제대로 유지되지 않는 문제 발생.
   - **해결**: 세션 설정을 재확인하고, 쿠키 옵션을 설정하여 세션 유지 문제를 해결.

2. **이미지 업로드 및 관리**:
   - **문제**: Multer와 AWS S3를 이용한 이미지 업로드 과정에서 파일 경로 설정 및 업로드된 파일 관리의 복잡성.
   - **해결**: multerS3를 이용하여 파일 업로드 로직을 단순화하고, 업로드된 파일의 접근 경로를 설정하여 문제 해결.

3. **상품 입찰 로직 구현**:
   - **문제**: 동시 입찰 시 데이터 무결성을 유지하기 위한 로직 작성의 어려움.
   - **해결**: MongoDB의 트랜잭션을 이용하여 입찰 과정에서의 데이터 무결성을 보장하고, 동시성 문제 해결.

4. **사용자 포인트 관리**:
   - **문제**: 입찰 시 포인트 차감 및 반환 로직의 복잡성.
   - **해결**: 트랜잭션을 이용하여 입찰 성공 시 포인트 차감 및 반환을 원자적으로 처리하여 문제 해결.

5. **검색 기능 구현**:
   - **문제**: 대규모 데이터에서 효율적인 검색 기능 구현의 어려움.
   - **해결**: MongoDB의 인덱스를 활용하여 검색 성능을 최적화하고, 검색 쿼리 최적화를 통해 효율적인 검색 기능 구현.

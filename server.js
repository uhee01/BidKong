const express = require('express')
const app = express()
const { MongoClient, ObjectId } = require('mongodb')
const bcrypt = require('bcrypt')


app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')


app.use(passport.initialize())
app.use(session({
    secret: '암호화에 쓸 비번',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 },
}))

app.use(passport.session())

require('dotenv').config()

const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const s3 = new S3Client({
    region: 'ap-northeast-2',
    credentials: {
        accessKeyId: process.env.S3_KEY,
        secretAccessKey: process.env.S3_SECRET
    }
})

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'whauction',
        key: function (요청, file, cb) {
            cb(null, Date.now().toString())
        }
    })
})

let db
const url = 'mongodb+srv://admin:qwer1234@cluster0.tvkogox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
new MongoClient(url).connect().then((client) => {
    console.log('DB연결성공')
    db = client.db('auction');
    app.listen(8080, () => {
        console.log('http://localhost:8080 에서 서버 실행중')
    })
}).catch((err) => {
    console.log(err)
})

function checkLogin(요청, 응답, next) {
    if (!요청.user) {
        응답.redirect('/login') // 로그인 여부 확인
    }
    next()
}


passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
    let result = await db.collection('user').findOne({ username: 입력한아이디 })
    if (!result) {
        return cb(null, false, { message: '아이디 DB에 없음' })
    }

    if (await bcrypt.compare(입력한비번, result.password)) {
        return cb(null, result)
    } else {
        return cb(null, false, { message: '비번불일치' });
    }
}))

// 세션, 쿠키 만들어줌
passport.serializeUser((user, done) => {
    process.nextTick(() => {
        done(null, { id: user._id, username: user.username, points: user.points })
    })
})

// 쿠키 분석
passport.deserializeUser(async (user, done) => {
    let result = await db.collection('user').findOne({ _id: new ObjectId(user.id) })
    delete result.password
    process.nextTick(() => {
        return done(null, user)
    })
})

// 모든 요청에 대해 user 정보를 뷰에 전달
app.use((req, res, next) => {
    res.locals.user = req.user; // passport에서 관리하는 req.user를 res.locals.user에 할당
    next();
});


const 카테고리 = ['전체', '음식', '옷', '디지털', '인형', '기타'];



// 랜덤으로 상품을 선택하는 함수
function getRandomProducts(products, count) {
    const shuffled = products.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

app.get('/', async (req, res) => {
    let products = await db.collection('products').find().toArray() // 모든 상품 가져오기
    const now = new Date();
    let validProducts = products.filter(product => {
        const productEndTime = new Date(product.endTime);
        return productEndTime > now; // 유효한 상품 필터링
    });
    const 랜덤상품 = getRandomProducts([...validProducts], 4); // 랜덤 상품 선택
    res.render('home', { 등록된상품: 랜덤상품, user: req.user });
});


app.get('/register', checkLogin, (req, res) => {
    res.render('register.ejs', { categories: 카테고리 });
});

app.post('/register', checkLogin, upload.single('img1'), async (요청, 응답) => {
    console.log(요청.body)
    console.log(요청.file.location)

    try {
        await db.collection('products').insertOne(
            {
                name: 요청.body.productName,
                content: 요청.body.description,
                category: 요청.body.category,
                image: 요청.file ? 요청.file.location : '', // 이미지 파일 경로 설정
                ownerId: new ObjectId(요청.user.id),
                owner: 요청.user.username,
                startPoint: parseInt(요청.body.startPrice),
                endTime: 요청.body.durationDate + ' ' + 요청.body.durationTime, // 종료 시간 설정
                minPoint: parseInt(요청.body.minimumBid),
                highestUserId: new ObjectId(요청.user.id),
                highestUser: 요청.user.username,
                currentPoint: parseInt(요청.body.startPrice),
                participants: [], // 참여자 목록 초기화
            })
        응답.redirect('/total')
    } catch (e) {
        console.log(e)
        응답.status(500).send('서버 에러남')
    }
})

app.get('/total', checkLogin, async (req, res) => {
    let products = await db.collection('products').find().toArray();
    const now = new Date();

    // endTime이 현재 시간보다 이후인 상품만 필터링
    let validProducts = products.filter(product => {
        const productEndTime = new Date(product.endTime);
        return productEndTime > now;
    });
    res.render('total.ejs', { 등록된상품: validProducts, 카테고리: 카테고리 });
});


app.get('/detail/:id', checkLogin, async (req, res) => {
    const currentUser = req.user ? req.user.username : null;
    let products = await db.collection('products').find().toArray()
    const productId = req.params.id; // URL에서 상품 ID 추출
    const product = products.find(item => item._id == productId);
    if (product) {
        res.render('detail.ejs', { productId: productId, product: product, currentUser: currentUser }); // 찾은 상품 정보를 detail.ejs로 전달
    } else {
        res.status(404).send('Product not found'); // 상품을 찾지 못한 경우 404 에러 전송
    }
});

// 입찰을 처리하는 API 엔드포인트
app.post('/bid/:id', checkLogin, async (req, res) => {
    const productId = req.params.id;
    const bid = parseInt(req.body.bid);
    const userName = req.user.username;

    // 사용자와 상품 정보를 동시에 조회
    let [product, user] = await Promise.all([
        db.collection('products').findOne({ '_id': new ObjectId(productId) }),
        db.collection('user').findOne({ 'username': userName })
    ]);

    if (!product) {
        return res.status(404).send('Product not found');
    }

    // 사용자가 입찰할 포인트가 충분한지 확인
    if (user.points < bid) {
        return res.status(400).send('Insufficient points');
    }

    const minBid = product.currentPoint + product.minPoint;

    if (bid >= minBid) {
        // 원래의 최고 입찰자에게 포인트 반환 처리
        if (product.highestUser) {
            await db.collection('users').updateOne(
                { 'username': product.highestUser },
                { $inc: { 'points': product.currentPoint } }
            );
        }

        // 새로운 입찰자의 포인트 감소 처리
        await db.collection('users').updateOne(
            { 'username': userName },
            { $inc: { 'points': -bid } }
        );

        // 입찰 가격이 최소 입찰 가격 이상일 때만 highestUser 및 currentPoint 업데이트
        await db.collection('products').updateOne(
            { '_id': new ObjectId(productId) },
            { $set: { 'highestUser': userName, 'currentPoint': bid } }
        );

        // participants 필드에 현재 유저 이름이 없으면 추가
        if (!product.participants.includes(userName)) {
            await db.collection('products').updateOne(
                { '_id': new ObjectId(productId) },
                { $push: { 'participants': userName } }
            );
        }
        res.status(200).send('성공');
    } else {
        res.status(400).send('입찰 금액이 너무 낮습니다.');
    }
});




function checkBlank(요청, 응답, next) {
    if (요청.body.username == '' || 요청.body.password == '') {
        응답.send('<script>alert("빈칸이 존재합니다."); history.go(-1);</script>');
    } else {
        next()
    }
}

app.get('/login', (req, res) => {
    res.render('login.ejs');
});


app.post('/login', (요청, 응답, next) => {
    passport.authenticate('local', (error, user, info) => {
        if (error) {
            return 응답.redirect('/login?error=서버 오류 발생');
        }
        if (!user) {
            // 로그인 실패 시 로그인 페이지로 리다이렉트
            return 응답.redirect('/login?error=' + encodeURIComponent(info.message));
        }
        요청.logIn(user, (err) => {
            if (err) {
                return 응답.redirect('/login?error=로그인 과정 중 오류 발생');
            }
            // 로그인 성공 시 홈페이지로 리다이렉트
            응답.redirect('/');
        });
    })(요청, 응답, next);
});

// 사용자 정보 가져오기 API
app.get('/get-user-status', (req, res) => {
    if (req.user) {
        res.json({ loggedIn: true, username: req.user.username });
    } else {
        res.json({ loggedIn: false });
    }
});


app.get('/join', (req, res) => {
    res.render('join.ejs');
});


app.post('/join', checkBlank, async (요청, 응답) => {
    let hashPassword = await bcrypt.hash(요청.body.password, 10)
    let isExist = await db.collection('user').findOne({ username: 요청.body.username });
    if (isExist != null) {
        응답.send('<script>alert("중복된 아이디입니다."); history.go(-1);</script>');
    } else if (요청.body.password != 요청.body.passwordCheck) {
        응답.send('<script>alert("비밀번호가 일치하지 않습니다."); history.go(-1);</script>');
    } else {
        await db.collection('user').insertOne({
            username: 요청.body.username,
            password: hashPassword,
            points: 5000
        });
        응답.redirect('/');
    }
})


app.get('/board', checkLogin, async (req, res) => {
    // _id 필드를 기준으로 내림차순 정렬하여 최신 데이터부터 조회
    let board = await db.collection('board').find().sort({ _id: -1 }).toArray();

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const paginatedBoard = board.slice(offset, offset + limit);
    const totalPages = Math.ceil(board.length / limit);

    // 현재 로그인한 사용자의 username 가져오기
    const currentUser = req.user ? req.user.username : null;

    // AJAX 요청인 경우 JSON 데이터 반환
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        res.json({
            board: paginatedBoard,
            currentPage: page,
            totalPages: totalPages,
            currentUser: currentUser
        });
    } else {
        // 일반 요청인 경우 HTML 페이지 렌더링
        res.render('board.ejs', { 게시판: paginatedBoard, currentUser: currentUser });
    }
});

app.delete('/doc', checkLogin, async (요청, 응답) => {
    db.collection('board').deleteOne({
        _id: new ObjectId(요청.query.docid),
    })
    응답.send('삭제완료')
})


app.get('/search', checkLogin, async (req, res) => {
    let board = await db.collection('board').find().toArray()

    const query = req.query.query; // URL 쿼리에서 검색어 가져오기
    const searchResult = board.filter(post =>
        post.title.includes(query) ||
        post.content.includes(query) ||
        post.writer.includes(query)
    );
    res.render('board', { 게시판: searchResult }); // 검색 결과를 같은 'board' 뷰로 렌더링
});

app.get('/write', checkLogin, (req, res) => {
    res.render('write.ejs');
});

app.post('/add', checkLogin, upload.single('img1'), async (요청, 응답) => {
    console.log(요청.body)
    console.log(요청.file.location)

    try {
        if (요청.body.title == '') {
            응답.send('제목 입력안함?')
        } else {
            await db.collection('board').insertOne(
                {
                    title: 요청.body.title,
                    content: 요청.body.content,
                    image: 요청.file ? 요청.file.location : '',
                    writerId: new ObjectId(요청.user.id),
                    writer: 요청.user.username
                })
            응답.redirect('/board')
        }
    } catch (e) {
        console.log(e)
        응답.status(500).send('서버 에러남')
    }
})

app.get('/post/:id', checkLogin, async (req, res) => {
    let board = await db.collection('board').find().toArray()
    let comment = await db.collection('comment').find().toArray()
    // 현재 로그인한 사용자의 username 가져오기
    const currentUser = req.user ? req.user.username : null;

    const postId = req.params.id; // URL에서 id 파라미터를 가져옴
    const 게시글 = board.find(게시글 => 게시글._id == postId); // 해당 id를 가진 게시글 찾기
    const 관련댓글 = comment.filter(댓글 => 댓글.boardId == postId); // 해당 게시글의 id와 일치하는 모든 댓글 찾기
    if (게시글) {
        res.render('post.ejs', { 게시글: 게시글, 댓글: 관련댓글, currentUser: currentUser }); // 게시글 정보와 댓글 데이터와 함께 post.ejs 렌더링
    } else {
        res.status(404).send('게시글을 찾을 수 없습니다.'); // 게시글이 없는 경우 404 에러 처리
    }
});

app.post('/comment', checkLogin, async (요청, 응답) => {
    try {
        if (요청.body.댓글 == '') {
            응답.send('댓글 입력하세요.')
        } else {
            const result = await db.collection('comment').insertOne({
                boardId: new ObjectId(요청.body.글id),
                content: 요청.body.댓글,
                writerId: new ObjectId(요청.user.id),
                writer: 요청.user.username,
            });

            const insertedComment = await db.collection('comment').findOne({ _id: result.insertedId });
            응답.json(insertedComment); // 추가된 댓글 데이터를 JSON으로 응답
        }
    } catch (e) {
        console.log(e)
        응답.status(500).send('서버 에러남')
    }
});



app.get('/myPage', checkLogin, async (req, res) => {
    // 유저 info
    const currentUser = req.user ? req.user : null;

    let products = await db.collection('products').find().toArray();

    // 현재 시간을 ISO 문자열로 변환
    const now = new Date().toISOString();

    // 내 상품 ( highest user = 나 && 경매종료 )
    let myProducts = products.filter(product =>
        product.highestUser === currentUser.username && product.endTime < now);

    // 내가 등록한 상품 (owner user = 나)
    let registeredProducts = products.filter(product =>
        product.owner === currentUser.username);

    // participating products ( 참여자에 내 이름 포함 && 경매중 )
    let participatingProducts = products.filter(product =>
        product.endTime > now && product.participants.includes(currentUser.username));


    res.render('myPage.ejs', { currentUser: currentUser, myProducts: myProducts, registeredProducts: registeredProducts, participatingProducts: participatingProducts });
});

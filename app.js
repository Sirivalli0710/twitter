const express = require('express')
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'twitterClone.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server Running')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const authenticateToken = (request, response, next) => {
  let jwtToken
  const authHeader = request.headers['authorization']

  if (authHeader !== undefined) {
    jwtToken = authHeader.split(' ')[1]
  }

  if (jwtToken === undefined) {
    response.status(401).send('Invalid JWT Token')
  } else {
    jwt.verify(jwtToken, 'SECRET_KEY', (error, payload) => {
      if (error) {
        response.status(401).send('Invalid JWT Token')
      } else {
        request.userId = payload.userId
        next()
      }
    })
  }
}

app.post('/register/', async (request, response) => {
  const {username, password, name, gender} = request.body

  const userQuery = `SELECT * FROM user WHERE username='${username}';`
  const dbUser = await db.get(userQuery)

  if (dbUser !== undefined) {
    response.status(400).send('User already exists')
  } else if (password.length < 6) {
    response.status(400).send('Password is too short')
  } else {
    const hashedPassword = await bcrypt.hash(password, 10)

    const createUserQuery = `
      INSERT INTO user(username, password, name, gender)
      VALUES('${username}','${hashedPassword}','${name}','${gender}');
    `

    await db.run(createUserQuery)
    response.send('User created successfully')
  }
})

app.post('/login/', async (request, response) => {
  const {username, password} = request.body

  const userQuery = `SELECT * FROM user WHERE username='${username}';`
  const dbUser = await db.get(userQuery)

  if (dbUser === undefined) {
    response.status(400).send('Invalid user')
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password)

    if (isPasswordMatched) {
      const payload = {userId: dbUser.user_id}
      const jwtToken = jwt.sign(payload, 'SECRET_KEY')

      response.send({jwtToken})
    } else {
      response.status(400).send('Invalid password')
    }
  }
})

app.get('/user/tweets/feed/', authenticateToken, async (request, response) => {
  const {userId} = request

  const query = `
      SELECT u.username, t.tweet, t.date_time AS dateTime, t.tweet_id AS tweetId
      FROM follower f
      JOIN tweet t ON f.following_user_id = t.user_id
      JOIN user u ON u.user_id = t.user_id
      WHERE f.follower_user_id = ${userId}
      ORDER BY t.date_time DESC
      LIMIT 4;
    `

  const tweets = await db.all(query)
  response.send(tweets)
})

app.get('/user/following/', authenticateToken, async (request, response) => {
  const {userId} = request

  const query = `
      SELECT u.name
      FROM follower f
      JOIN user u ON f.following_user_id = u.user_id
      WHERE f.follower_user_id = ${userId};
    `

  const users = await db.all(query)
  response.send(users)
})

app.get('/user/followers/', authenticateToken, async (request, response) => {
  const {userId} = request

  const query = `
      SELECT u.name
      FROM follower f
      JOIN user u ON f.follower_user_id = u.user_id
      WHERE f.following_user_id = ${userId};
    `

  const users = await db.all(query)
  response.send(users)
})

const checkFollowing = async (userId, tweetId) => {
  const query = `
    SELECT * FROM tweet t
    JOIN follower f ON t.user_id = f.following_user_id
    WHERE t.tweet_id = ${tweetId}
    AND f.follower_user_id = ${userId};
  `
  return await db.get(query)
}

app.get('/tweets/:tweetId/', authenticateToken, async (request, response) => {
  const {userId} = request
  const {tweetId} = request.params

  const valid = await checkFollowing(userId, tweetId)

  if (!valid) {
    response.status(401).send('Invalid Request')
  } else {
    const query = `
        SELECT
          t.tweet,
          COUNT(DISTINCT l.like_id) AS likes,
          COUNT(DISTINCT r.reply_id) AS replies,
          t.date_time AS dateTime
        FROM tweet t
        LEFT JOIN like l ON t.tweet_id = l.tweet_id
        LEFT JOIN reply r ON t.tweet_id = r.tweet_id
        WHERE t.tweet_id = ${tweetId};
      `

    const result = await db.get(query)
    response.send(result)
  }
})

app.get(
  '/tweets/:tweetId/likes/',
  authenticateToken,
  async (request, response) => {
    const {userId} = request
    const {tweetId} = request.params

    const valid = await checkFollowing(userId, tweetId)

    if (!valid) {
      response.status(401).send('Invalid Request')
    } else {
      const query = `
        SELECT u.username
        FROM like l
        JOIN user u ON l.user_id = u.user_id
        WHERE l.tweet_id = ${tweetId};
      `

      const rows = await db.all(query)

      response.send({
        likes: rows.map(each => each.username),
      })
    }
  },
)

app.get(
  '/tweets/:tweetId/replies/',
  authenticateToken,
  async (request, response) => {
    const {userId} = request
    const {tweetId} = request.params

    const valid = await checkFollowing(userId, tweetId)

    if (!valid) {
      response.status(401).send('Invalid Request')
    } else {
      const query = `
        SELECT u.name, r.reply
        FROM reply r
        JOIN user u ON r.user_id = u.user_id
        WHERE r.tweet_id = ${tweetId};
      `

      const replies = await db.all(query)
      response.send({replies})
    }
  },
)

app.get('/user/tweets/', authenticateToken, async (request, response) => {
  const {userId} = request

  const query = `
      SELECT
        t.tweet,
        t.tweet_id AS tweetId,
        COUNT(DISTINCT l.like_id) AS likes,
        COUNT(DISTINCT r.reply_id) AS replies,
        t.date_time AS dateTime
      FROM tweet t
      LEFT JOIN like l ON t.tweet_id = l.tweet_id
      LEFT JOIN reply r ON t.tweet_id = r.tweet_id
      WHERE t.user_id = ${userId}
      GROUP BY t.tweet_id;
    `

  const tweets = await db.all(query)
  response.send(tweets)
})

app.post('/user/tweets/', authenticateToken, async (request, response) => {
  const {userId} = request
  const {tweet} = request.body

  const query = `
      INSERT INTO tweet(tweet, user_id, date_time)
      VALUES('${tweet}', ${userId}, datetime('now'));
    `

  await db.run(query)
  response.send('Created a Tweet')
})

app.delete(
  '/tweets/:tweetId/',
  authenticateToken,
  async (request, response) => {
    const {userId} = request
    const {tweetId} = request.params

    const query = `
      SELECT * FROM tweet
      WHERE tweet_id = ${tweetId}
      AND user_id = ${userId};
    `

    const tweet = await db.get(query)

    if (!tweet) {
      response.status(401).send('Invalid Request')
    } else {
      await db.run(`DELETE FROM tweet WHERE tweet_id = ${tweetId};`)
      response.send('Tweet Removed')
    }
  },
)

module.exports = app

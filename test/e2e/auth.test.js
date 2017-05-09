const db = require('./db');
const request = require('./request');
const assert = require('chai').assert;

describe('auth tests', () => {
  let token = '';

  before(db.drop);

  const user = {
    email: 'mofo37@me.com',
    password: 'catsrkewl'
  };

  describe('user management', () => {

    const badRequest = (url, data, code, error) =>
      request
        .post(url)
        .send(data)
        .then(
        () => { throw new Error('status should not be okay'); },
        res => {
          assert.equal(res.status, code);
          assert.equal(res.response.body.error, error);
        });

    it('signup requires email', () =>
      badRequest('/auth/signup', { password: 'catsrkewl' }, 400, 'email and password required')
    );

    it('signup requires password', () =>
      badRequest('/auth/signup', { password: 'catsrkewl' }, 400, 'email and password required')
    );

    let token = '';

    it('signup', () =>
      request
        .post('/auth/signup')
        .send(user)
        .then(res => assert.ok(token = res.body.token))
    );

    it('can\'t use same email', () =>
      badRequest('/auth/signup', user, 400, 'username already exists')
    );

    it('signin requires email', () =>
      badRequest('/auth/signin', { password: 'catsrkewl' }, 400, 'email and password must be supplied')
    );

    it('signin requires password', () =>
      badRequest('/auth/signin', { email: 'beibs@me.com' }, 400, 'email and password must be supplied')
    );

    it('signin with wrong user', () =>
      badRequest('/auth/signin', { email: 'beibs@me.com', password: user.password }, 401, 'invalid email or password')
    );

    it('signin with wrong password', () =>
      badRequest('/auth/signin', { email: user.email, password: 'bad' }, 401, 'invalid username or password')
    );

    it('signin', () =>
      request
        .post('/auth/signin')
        .send(user)
        .then(res => assert.ok(res.body.token))
    );

    it('token is invalid', () =>
      request
        .get('/auth/verify')
        .set('authorization', 'bad token')
        .then(
        () => { throw new Error('success response not expected'); },
        (res) => { assert.equal(res.status, 401); }
        )
    );

    it('token is valid', () =>
      request
        .get('auth/verify')
        .set('authorization', token)
        .then(res => assert.ok(res.body))
    );
  });

  describe('unauthorized', () => {

    it('401 with no token', () => {
      return request
        .get('/me')
        .then(
        () => { throw new Error('status should not be 200'); },
        res => {
          assert.equal(res.status, 401);
          assert.equal(res.response.body.error, 'Unauthorized');
        }
        );
    });

    it('403 with invalid token', () => {
      return request
        .get('/me')
        .set('authorization', 'bad token')
        .then(
        () => { throw new Error('status should not be 200'); },
        res => {
          assert.equal(res.status, 401);
          assert.equal(res.response.body.error, 'unauthorized');
        }
        );
    });
  });
});
//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

const mongoose = require('mongoose');
const User = require('../server/models/User');
require('dotenv').config();

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

const user = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@gmail.com",
    username: "phildefranco",
    password: "john_doe"
}

let userId;

//Our parent block
describe('Users', () => {
    after(done => {
        User.remove({ username: user.username }, (err) => {
            done();
        });
    })

    describe('GET /user/hello', () => {
        it('it should get a hello response to test these routes', (done) => {
            chai.request(server)
                .get('/api/v1/user/hello')
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.have.property('status').eql('hello');
                    done();
                })

        });
    });
    describe('POST /user', () => {
        it('it should create a new user', (done) => {
            chai.request(server)
                .post('/api/v1/user')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.should.be.an('object');
                    res.body.should.have.property('userId');
                    res.body.should.have.property('firstName');
                    res.body.should.have.property('lastName');
                    res.body.should.have.property('email');
                    res.body.should.have.property('username');
                    res.body.should.not.have.property('password');
                    userId = res.body.userId;
                    done();
                });
        });

        it('it should not add a user without an email', (done) => {
            const tempUser = { ...user };
            delete tempUser.email;

            chai.request(server)
                .post('/api/v1/user')
                .send(tempUser)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('error').eql('missingPOSTData');
                    res.body.should.have.property('message').eql('Missing value in POST: email');
                    done();
                });
        });

        it('it should not create a user without a username', (done) => {
            const tempUser = { ...user };
            delete tempUser.username;

            chai.request(server)
                .post('/api/v1/user')
                .send(tempUser)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('error').eql('missingPOSTData');
                    res.body.should.have.property('message').eql('Missing value in POST: username');
                    done();
                });
        });

        it('it should not add a user with an existing username', (done) => {
            const tempUser = { ...user };
            tempUser.email += 'm';

            chai.request(server)
                .post('/api/v1/user')
                .send(tempUser)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('error').eql('duplicateKeyError');
                    res.body.should.have.property('message');
                    res.body.should.have.property('field').eql('username');
                    done();
                });
        });

        it('it should not add a user with an existing email', (done) => {
            const tempUser = { ...user };
            tempUser.username += '1';

            chai.request(server)
                .post('/api/v1/user')
                .send(tempUser)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('error').eql('duplicateKeyError');
                    res.body.should.have.property('message');
                    res.body.should.have.property('field').eql('email');
                    done();
                });
        });

        it('it should not add a user with an invalid property length', (done) => {
            const tempUser = { ...user };
            tempUser.email += '1';
            tempUser.username += '1';
            tempUser.firstName = '1';

            chai.request(server)
                .post('/api/v1/user')
                .send(tempUser)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('error').eql('invalidPOSTData');
                    res.body.should.have.property('message').eql('Invalid value in POST: firstName');
                    done();
                });
        });
    });

    describe('GET /user/:user_id', () => {
        it('should return a user object if given a valid user id', (done) => {
            chai.request(server)
                .get(`/api/v1/user/${userId}`)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.have.property('_id');
                    res.body.should.have.property('userId').eql(userId);
                    res.body.should.have.property('firstName').eql(user.firstName);
                    res.body.should.have.property('lastName').eql(user.lastName);
                    res.body.should.have.property('email').eql(user.email);
                    res.body.should.have.property('username').eql(user.username);
                    done();
                })
        });

        it('should return an error if the userID does not exist', (done) => {
            chai.request(server)
                .get(`/api/v1/user/-1`)
                .send()
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('error').eql('doesNotExist');
                    res.body.should.have.property('message').eql('User does not exist');
                    done();
                })
        });
    });

    describe('POST /user/login', () => {
        it('should log in with valid details', (done) => {
            chai.request(server)
                .post('/api/v1/user/login')
                .send({ email: user.email, password: user.password })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.have.property('message').eql('Login successful');
                    done();
                });
        });

        it('should return an error if the password is wrong', (done) => {
            chai.request(server)
                .post('/api/v1/user/login')
                .send({ email: user.email, password: "wrong_password" })
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.should.be.an('object');
                    res.body.should.have.property('error').eql('invalidPassword');
                    done();
                });
        });

        it('should return an error if the email doesn\'t exist', (done) => {
            chai.request(server)
                .post('/api/v1/user/login')
                .send({ email: "wrong_password", password: user.password })
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('error').eql('doesNotExist');
                    done();
                });
        });

        it('should return an error if the password is not provided', (done) => {
            chai.request(server)
                .post('/api/v1/user/login')
                .send({ email: user.email })
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('error').eql('missingPOSTData');
                    res.body.should.have.property('message').eql('Missing value in POST: password');
                    done();
                });
        });
    });

    describe('GET /user/all', () => {
        it('it should return all users in the database', (done) => {
            chai.request(server)
                .get('/api/v1/user/all')
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body.should.have.lengthOf.above(0);
                    res.body[0].should.be.an('object');
                    res.body[0].should.have.property('_id');
                    res.body[0].should.have.property('userId');
                    res.body[0].should.have.property('firstName');
                    res.body[0].should.have.property('lastName');
                    res.body[0].should.have.property('email');
                    res.body[0].should.have.property('username');
                    done();
                });
        });
    });

    describe('DELETE /user/:user_id', () => {
        it('it should delete a user given a valid user id', (done) => {
            chai.request(server)
                .delete(`/api/v1/user/${userId}`)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('object');
                    res.body.should.have.property('message').eql('User deleted successfully');
                    done();
                });
        });
        it('it throw an error if a user has been deleted', (done) => {
            chai.request(server)
                .delete(`/api/v1/user/${userId}`)
                .send()
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('error').eql('doesNotExist');
                    res.body.should.have.property('message').eql('User does not exist');
                    done();
                });
        });
        it('it throw an error if a username is invalid', (done) => {
            chai.request(server)
                .delete(`/api/v1/user/-1`)
                .send()
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('error').eql('doesNotExist');
                    res.body.should.have.property('message').eql('User does not exist');
                    done();
                });
        });
        it('it should not be able to GET a deleted user', (done) => {
            chai.request(server)
                .delete(`/api/v1/user/${userId}`)
                .send()
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.an('object');
                    res.body.should.have.property('error').eql('doesNotExist');
                    res.body.should.have.property('message').eql('User does not exist');
                    done();
                });
        });
    });

});
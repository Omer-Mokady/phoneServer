const chai = require('chai');
const chaiHttp = require('chai-http');
const route = require('../server/routes/phoneRoute')
const server = require('../server/server')
chai.should();
chai.use(chaiHttp);

describe('Task API', () => {
    describe(`GET all db - in path: '/phones/'`, () => {
        it('Should GET all the data from db', (done) => {
            chai.request(server).get('/phones').end((err, response) => {
                response.body.length.should.be.eq(2);
                response.should.have.status(200);
                response.body.should.be.a('array');
                done();
            });
        });

        it('Should get error for uncorrect path', (done) => {
            chai.request(server).get('/phone').end((err, response) => {
                response.should.have.status(404);
                done();
            });
        });
    });



    describe(`GET by serial operation - in path: '/phones/:serial'`, () => {
        it('Should GET the required data from db', (done) => {
            const serialVal = '12345678XCF';
            chai.request(server).get('/phones/'+serialVal).end((err, response) => {
                response.should.have.status(200);
                response.body.length.should.be.eq(1);
                response.body.should.be.a('array');
                (response.body)[0].should.have.keys('serial', 'type', 'color', 'metadata');
                (response.body)[0].should.have.property('serial').eq(serialVal);
                done();
            });
        });

        it('Should get error for unknown serial', (done) => {
            const serialVal = 'notExist';
            chai.request(server).get('/phones/'+serialVal).end((err, response) => {
                response.should.have.status(404);
                response.body.should.be.a('object');
                response.body.should.have.property('error').eq('404 - The certain serial does not exist in db.');
                done();
            });
        });
    });



    describe(`POST operation - in path: '/phones/'`, () => {
        it('Should POST a new phone info into the db', (done) => {
            chai.request(server).post('/phones/')
            .send({
                "serial" : "1234",
                "type" : "android",
                "color" : "green",
                "metadata" : {
                    "firstData" : "data1",
                    "secondData" : "data2"
                }
            })
            .end((err, response) => {
                response.should.have.status(201);
                done();
            });
        });

        it('should get error for json which already exist', (done) => {
            chai.request(server).post('/phones/')
            .send({
                "serial" : "12345678XCF",
                "type" : "android",
                "color" : "green",
                "metadata" : {
                    "firstData" : "data1",
                    "secondData" : "data2"
                }
            })
            .end((err, response) => {
                response.should.have.status(400);
                response.body.should.be.a('object');
                response.body.should.have.property('error').eq('400 - The serial property is already exists in the db.');
                done();
            });
        });
        
        it(`post without 'type' and 'metadata' (not PK) properties`, (done) => { 
            chai.request(server).post('/phones/')
            .send({
                "serial" : "1111111",
                "color" : "green",
            })
            .end((err, response) => {
                response.should.have.status(201);
                done();
            });

            
        });

        it('continue - expect: type=null, metadata=null', (done) => {
            const serialVal = "1111111";
            chai.request(server).get('/phones/'+serialVal).end((err, response) => {
                response.should.have.status(200);
                response.body.length.should.be.eq(1);
                response.body.should.be.a('array');
                (response.body)[0].should.have.keys('serial', 'type', 'color', 'metadata');
                (response.body)[0].should.have.property('type').eq(null);
                (response.body)[0].should.have.property('metadata').eq(null);
                done();
            });
        });

        it('POST with unknown property + POST more than 4 properties - should work', (done) => {
            chai.request(server).post('/phones/')
            .send({
                "serial" : "123",
                "type" : "android",
                "color" : "green",
                "unknown" : "something",
                "metadata" : {
                    "firstData" : "data1",
                    "secondData" : "data2"
                }
            })
            .end((err, response) => {
                response.should.have.status(201);
                done();
            });
        });
    });



    describe(`Patch by serial operation - in path: '/phones/:serial'`, () => {
        it('Should update the required data in db', (done) => {
            const serialVal = '12345678XCF';
            chai.request(server).patch('/phones/'+serialVal).send({
                "serial" : "12345678XCF",
                "type" : "android",
                "color" : "black",
                "metadata" : {
                    "one" : "1",
                    "two" : "2"
                }
            })
            .end((err, response) => {
                response.should.have.status(201);
                done();
            });
        });

        it('continue - update the required data from db - checking changes', (done) => {
            const serialVal = "12345678XCF";
            chai.request(server).get('/phones/'+serialVal).end((err, response) => {
                response.should.have.status(200);
                response.body.length.should.be.eq(1);
                response.body.should.be.a('array');
                (response.body)[0].should.have.keys('serial', 'type', 'color', 'metadata');
                (response.body)[0].should.have.property('serial').eq('12345678XCF');
                (response.body)[0].should.have.property('type').eq('android');
                (response.body)[0].should.have.property('color').eq('black');
                (response.body)[0].should.have.property('metadata').eq('1130b9bc32efe2b779d7df7cbb7c1ae0dc978d9fe234f9e7b0ddfc57e2992355');
                done();
            });
        });

        it('Should update only few valid properties for the required data from db', (done) => {
            const serialVal = '12345678XCF';
            chai.request(server).patch('/phones/'+serialVal).send({
                "type" : "iphone",
                "metadata" : {
                    "one" : "1",
                    "two" : "2"
                }
            })
            .end((err, response) => {
                response.should.have.status(201);
                done();
            });
        });

        it('continue - update the required data from db - checking changes', (done) => {
            const serialVal = "12345678XCF";
            chai.request(server).get('/phones/'+serialVal).end((err, response) => {
                response.should.have.status(200);
                response.body.length.should.be.eq(1);
                response.body.should.be.a('array');
                (response.body)[0].should.have.keys('serial', 'type', 'color', 'metadata');
                (response.body)[0].should.have.property('serial').eq('12345678XCF');
                (response.body)[0].should.have.property('type').eq('iphone');
                (response.body)[0].should.have.property('color').eq('black');
                (response.body)[0].should.have.property('metadata').eq('1130b9bc32efe2b779d7df7cbb7c1ae0dc978d9fe234f9e7b0ddfc57e2992355');
                done();
            });
        });

        it('Should get error for updating unknown property', (done) => {
            const serialVal = '12345678XCF';
            chai.request(server).patch('/phones/'+serialVal).send({
                "serial" : "12345678XCF",
                "unkown" : "something",
                "color" : "black",
                "metadata" : {
                    "one" : "1",
                    "two" : "2"
                }
            })
            .end((err, response) => {
                response.should.have.status(400);
                done();
            });
        });

        it('Should get error for updating unknown serial number', (done) => {
            const serialVal = 'unknown';
            chai.request(server).patch('/phones/'+serialVal).send({
                "type" : "android",
                "color" : "black",
                "metadata" : {
                    "one" : "1",
                    "two" : "2"
                }
            })
            .end((err, response) => {
                response.should.have.status(404);
                response.body.should.have.property('error').eq('404 - The certain serial does not exist in db.');
                done();
            });
        });
    });



    describe(`DELETE by serial - in path: w/phones/:serial'`, () => {
        it('post a new phone into the db', (done) => {
                chai.request(server).post('/phones/')
                .send({
                    "serial" : "abcdefg",
                    "type" : "android",
                    "color" : "white",
                    "metadata" : {
                        "one" : "1",
                        "two" : "2"
                    }
                })
                .end((err, response) => {
                    response.should.have.status(201);
                    done();
                });
            });

        it('continue - delete the phone data from db', (done) => {
            const serialVal = 'abcdefg';
            chai.request(server).delete('/phones/'+serialVal)
            .end((err, response) => {
                response.should.have.status(200);
                done();
            });
        });

        it('continue - check changes in the db - should not find value', (done) => {
            const serialVal = "abcdefg";
            chai.request(server).get('/phones/'+serialVal).end((err, response) => {
                response.should.have.status(404);
                response.body.should.have.property('error').eq('404 - The certain serial does not exist in db.');
                done();
            });
        });
    });
});
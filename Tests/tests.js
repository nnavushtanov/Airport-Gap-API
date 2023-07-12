let baseURL = "https://airportgap.dev-tester.com/api/";
const request = require("supertest")(baseURL);
const expect = require("chai").expect;

let loginMail = "fortestingonly@mail.bg";
let loginPass = "Thisisfortesting1";

let token = "";
let iata_id = "SOF";
let airport_id;
let airportNote = "for testing";
let updatedNote = "this is updated note";

describe("Healthcheck", function () {
    it("Get first page of airports and verify that you are at it", async function () {
        const response = await request
            .get("airports")
        expect(response.status).to.eql(200);
        // Verify that you are on the first page and the next one is the second
        expect(response.body.links.first).to.eql(baseURL + 'airports')
        expect(response.body.links.next).to.eql(baseURL + 'airports?page=2')
        expect(response.body.data.length).to.eql(30);
        // 
    })
})

describe("Add airport test", function () {
    it("Login", async function () {
        const response = await request
            .post("tokens")
            .send({
                "email": loginMail,
                "password": loginPass
            })
        expect(response.status).to.eql(200);
        token = response.body.token
        // Verify that the value of token which is returned is the same length as expected
        expect(token.length).to.eql(24)
    })
    it("Add airport", async function () {
        const response = await request
            .post("favorites")
            .set('Authorization', 'Bearer ' + token)
            .send({
                "airport_id": iata_id,
                "note": airportNote
            })
        expect(response.status).to.eql(201)
        expect(response.body.data.type).to.eql("favorite")
        expect(response.body.data.attributes.note).to.eql(airportNote)
        airport_id = response.body.data.id;
    })
    it("Confirm that the airport is added to favorites", async function () {
        const response = await request
            .get(`favorites/${airport_id}`)
            .set('Authorization', 'Bearer ' + token)
        expect(response.status).to.eql(200);
        if (response.body.data.length == 0) {
            console.log("There aren't any favorite airports");
        } else if (response.body.data.length > 0) {
            airport_id = response.body.data[0].id;
            expect(response.body.data[0].id).to.eql(airport_id);
            expect(response.body.data[0].type).to.eql("favorite");
        }
    })
})

describe("Edit airport", function () {
    it("Login", async function () {
        const response = await request
            .post("tokens")
            .send({
                "email": loginMail,
                "password": loginPass
            })
        expect(response.status).to.eql(200);
        token = response.body.token
        // Verify that the value of token which is returned is the same length as expected
        expect(token.length).to.eql(24)
    })
    it("Get favorite airports", async function () {
        const response = await request
            .get(`favorites/${airport_id}`)
            .set('Authorization', 'Bearer ' + token)
        expect(response.status).to.eql(200);
        if (response.body.data.length == 0) {
            console.log("There aren't any favorite airports");
        } else if (response.body.data.length > 0) {
            expect(response.body.data[0].id).to.eql(airport_id);
            expect(response.body.data[0].type).to.eql("favorite");
            expect(response.body.data.attributes.note).to.eql(airportNote)
        }
    })
    it("Edit airport", async function () {
        const response = await request
            .patch(`favorites/${airport_id}`)
            .set('Authorization', 'Bearer ' + token)
            .send({
                "note": updatedNote
            })
        expect(response.status).to.eql(200)
        expect(response.body.data.attributes.note).to.eql(updatedNote)

    })
    it("Confirm that the note is updated", async function () {
        const response = await request
            .get(`favorites/${airport_id}`)
            .set('Authorization', 'Bearer ' + token)
        expect(response.status).to.eql(200);
        if (response.body.data.length == 0) {
            console.log("There aren't any favorite airports");
        } else if (response.body.data.length > 0) {
            expect(response.body.data[0].id).to.eql(airport_id);
            expect(response.body.data[0].type).to.eql("favorite");
            expect(response.body.data.attributes.note).to.eql(updatedNote)
        }
    })
})

describe("Delete airport", function () {
    it("Get favorite airports", async function () {
        const response = await request
            .get(`favorites/${airport_id}`)
            .set('Authorization', 'Bearer ' + token)
        expect(response.status).to.eql(200);
        if (response.body.data.length == 0) {
            console.log("There aren't any favorite airports");
        } else if (response.body.data.length > 0) {
            expect(response.body.data[0].id).to.eql(airport_id);
            expect(response.body.data[0].type).to.eql("favorite");
        }
    })
    it("Delete airport", async function () {
        const response = await request
            .delete(`favorites/${airport_id}`)
            .set('Authorization', 'Bearer ' + token)
            .send({
                "id": airport_id
            })
        expect(response.status).to.eql(204)
    })
    it("Confirm that airport is deleted", async function () {
        const response = await request
            .get(`favorites`)
            .set('Authorization', 'Bearer ' + token)
        expect(response.status).to.eql(200);
        if (response.body.data.length == 0) {
            console.log("There aren't any favorite airports");
        } else if (response.body.data.length > 0) {
            expect(response.body.data[0].id).to.eql(airport_id);
            expect(response.body.data[0].type).to.eql("favorite");
        }
    })
})



// Tests unitaires   

import { InMemoryWebinarRepository } from "../adapters/webinar-repository.in-memory";
import { ChangeSeats } from "../use-cases/change-seats";
import { Webinar } from "../entities/webinar.entity";
import { testUser } from "src/users/tests/user-seeds";


describe("Feature: Change seats", () => {
    let webinarRepository: InMemoryWebinarRepository;
    let useCase: ChangeSeats;

    const webinar = new Webinar({
        id: "webinar-id",
        organizerId: testUser.alice.props.id,
        title: "Webinar title",
        startDate: new Date("2024-01-01T00:00:00Z"),
        endDate: new Date("2024-01-01T01:00:00Z"),
        seats: 100,
    });

    beforeEach(() => {
        webinarRepository = new InMemoryWebinarRepository([webinar]);
        useCase = new ChangeSeats(webinarRepository);
    });

    describe("Scenario: Happy path", () => {
        const payload = {
            user: testUser.alice,
            webinarId: "webinar-id",
            seats: 200,
        };

        it("should change the number of seats for a webinar", async () => {
            await useCase.execute(payload);

            const updatedWebinar = await webinarRepository.findById("webinar-id");
            expect(updatedWebinar?.props.seats).toEqual(200);
        });
    });

    describe("Scenario: Webinar does not exist", () => {
        const payload = {
            user: testUser.alice,
            webinarId: "non-existing-webinar-id",
            seats: 200,
        };

        it("should fail", async () => {
            await expect(useCase.execute(payload)).rejects.toThrow("Webinar not found");

            const webinar = webinarRepository.findByIdSync("webinar-id");
            expect(webinar?.props.seats).toEqual(100);
        });
    });

    describe("Scenario: Update the webinar of someone else", () => {
        const payload = {
            user: testUser.bob,
            webinarId: "webinar-id",
            seats: 200,
        };

        it("should fail", async () => {
            await expect(useCase.execute(payload)).rejects.toThrow("User is not allowed to update this webinar");


            const webinar = webinarRepository.findByIdSync("webinar-id");
            expect(webinar?.props.seats).toEqual(100);
        });
    });

    describe("Scenario: Change seats to an inferior number", () => {
        const payload = {
            user: testUser.alice,
            webinarId: "webinar-id",
            seats: 50,
        };

        it("should fail", async () => {
            //await expect(useCase.execute(payload)).rejects.toThrow("Cannot reduce the number of seats");
            await expect(useCase.execute(payload)).rejects.toThrow("You cannot reduce the number of seats");


            const webinar = webinarRepository.findByIdSync("webinar-id");
            expect(webinar?.props.seats).toEqual(100);
        });
    });

    describe("Scenario: Change seats to a number > 1000", () => {
        const payload = {
            user: testUser.alice,
            webinarId: "webinar-id",
            seats: 1500,
        };

        it("should fail", async () => {
            await expect(useCase.execute(payload)).rejects.toThrow("Webinar must have at most 1000 seats");


            const webinar = webinarRepository.findByIdSync("webinar-id");
            expect(webinar?.props.seats).toEqual(100);
        });
    });

    function expectWebinarToRemainUnchanged() {
        const webinar = webinarRepository.findByIdSync("webinar-id");
        expect(webinar?.props.seats).toEqual(100);
    }

    function whenUserChangeSeatsWith(payload: any) {
        return useCase.execute(payload);
    }

    function thenUpdatedWebinarSeatsShouldBe(seats: number) {
        const updatedWebinar = webinarRepository.findByIdSync("webinar-id");
        expect(updatedWebinar?.props.seats).toEqual(seats);
    }
});

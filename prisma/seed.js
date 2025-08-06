"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var faker_1 = require("@faker-js/faker");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var services, i, address, customer, project, invoice, _loop_1, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(Array.from({ length: 3 }).map(function () {
                        return prisma.service.create({
                            data: { name: faker_1.faker.commerce.product() },
                        });
                    }))];
                case 1:
                    services = _a.sent();
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < 5)) return [3 /*break*/, 8];
                    return [4 /*yield*/, prisma.address.create({
                            data: {
                                street: faker_1.faker.location.streetAddress(),
                                postalCode: faker_1.faker.location.zipCode(),
                                city: faker_1.faker.location.city(),
                            },
                        })];
                case 3:
                    address = _a.sent();
                    return [4 /*yield*/, prisma.customer.create({
                            data: {
                                name: faker_1.faker.company.name(),
                                email: faker_1.faker.internet.email(),
                                type: 'company',
                                cvrNumber: faker_1.faker.string.numeric(8),
                                address: { connect: { id: address.id } },
                            },
                        })];
                case 4:
                    customer = _a.sent();
                    return [4 /*yield*/, prisma.project.create({
                            data: {
                                name: faker_1.faker.commerce.productName(),
                                customer: { connect: { id: customer.id } },
                                startDate: faker_1.faker.date.past(),
                                status: 'active',
                                address: { connect: { id: address.id } },
                            },
                        })];
                case 5:
                    project = _a.sent();
                    return [4 /*yield*/, prisma.invoice.create({
                            data: {
                                projectId: project.id,
                                status: 'pending',
                                date: faker_1.faker.date.recent(),
                                services: {
                                    create: services.map(function (service) { return ({
                                        serviceId: service.id,
                                        amount: faker_1.faker.number.int({ min: 5000, max: 20000 }),
                                        quantity: faker_1.faker.number.int({ min: 1, max: 5 }),
                                    }); }),
                                },
                            },
                        })];
                case 6:
                    invoice = _a.sent();
                    _a.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 2];
                case 8:
                    _loop_1 = function (i) {
                        var address, worker, randomProject;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, prisma.address.create({
                                        data: {
                                            street: faker_1.faker.location.streetAddress(),
                                            postalCode: faker_1.faker.location.zipCode(),
                                            city: faker_1.faker.location.city(),
                                        },
                                    })];
                                case 1:
                                    address = _b.sent();
                                    return [4 /*yield*/, prisma.worker.create({
                                            data: {
                                                name: faker_1.faker.person.fullName(),
                                                email: faker_1.faker.internet.email(),
                                                position: faker_1.faker.person.jobTitle(),
                                                dailyRate: faker_1.faker.number.int({ min: 20000, max: 35000 }),
                                                startDate: faker_1.faker.date.past({ years: 1 }),
                                                address: { connect: { id: address.id } },
                                            },
                                        })];
                                case 2:
                                    worker = _b.sent();
                                    return [4 /*yield*/, prisma.project.findMany({
                                            take: 1,
                                            orderBy: { createdAt: 'desc' },
                                        })];
                                case 3:
                                    randomProject = (_b.sent())[0];
                                    if (!randomProject) return [3 /*break*/, 6];
                                    return [4 /*yield*/, prisma.projectAssignment.create({
                                            data: {
                                                workerId: worker.id,
                                                projectId: randomProject.id,
                                                startDate: faker_1.faker.date.past({ years: 1 }),
                                            },
                                        })];
                                case 4:
                                    _b.sent();
                                    // Create 5 Work Entries
                                    return [4 /*yield*/, Promise.all(Array.from({ length: 5 }).map(function () {
                                            return prisma.workEntry.create({
                                                data: {
                                                    workerId: worker.id,
                                                    projectId: randomProject.id,
                                                    date: faker_1.faker.date.recent({ days: 30 }),
                                                    isFullDay: faker_1.faker.datatype.boolean(),
                                                    notes: faker_1.faker.lorem.sentence(),
                                                },
                                            });
                                        }))];
                                case 5:
                                    // Create 5 Work Entries
                                    _b.sent();
                                    _b.label = 6;
                                case 6: 
                                // Payment
                                return [4 /*yield*/, prisma.payment.create({
                                        data: {
                                            workerId: worker.id,
                                            amount: faker_1.faker.number.int({ min: 40000, max: 60000 }),
                                            date: faker_1.faker.date.recent(),
                                            status: 'paid',
                                            notes: 'Monthly salary',
                                        },
                                    })];
                                case 7:
                                    // Payment
                                    _b.sent();
                                    // Vacation
                                    return [4 /*yield*/, prisma.vacation.create({
                                            data: {
                                                workerId: worker.id,
                                                startDate: faker_1.faker.date.recent(),
                                                endDate: faker_1.faker.date.soon(),
                                                approved: faker_1.faker.datatype.boolean(),
                                                reason: faker_1.faker.lorem.words(3),
                                            },
                                        })];
                                case 8:
                                    // Vacation
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 9;
                case 9:
                    if (!(i < 5)) return [3 /*break*/, 12];
                    return [5 /*yield**/, _loop_1(i)];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11:
                    i++;
                    return [3 /*break*/, 9];
                case 12:
                    console.log('Multiple test records seeded successfully!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return prisma.$disconnect(); });

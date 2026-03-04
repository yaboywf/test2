import Calendar from "./Calendar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getServerSession } from "@/lib/jwt";

const calendar = {
    "January": [
        { "date": "2026-01-01", "activity": "New Year's Day" },
        { "date": "2026-01-03", "activity": "Parade" },
        { "date": "2026-01-10", "activity": "Parade" },
        { "date": "2026-01-12", "activity": "BB Day (Parade in School)" },
        { "date": "2026-01-17", "activity": "Parade" },
        { "date": "2026-01-24", "activity": "Parade" },
        { "date": "2026-01-31", "activity": "Parade" }
    ],
    "February": [
        { "date": "2026-02-07", "activity": "Parade" },
        { "date": "2026-02-14", "activity": "Parade" },
        { "date": "2026-02-17", "activity": "Chinese New Year" },
        { "date": "2026-02-18", "activity": "Chinese New Year" },
        { "date": "2026-02-21", "activity": "No Parade" },
        { "date": "2026-02-28", "activity": "Parade / Kayaking 1-Start (Sec 2s Only)" }
    ],
    "March": [
        { "date": "2026-03-01", "activity": "Kayaking 1-Start (Sec 2s Only)" },
        { "date": "2026-03-07", "activity": "Parade" },
        { "date": "2026-03-13", "activity": "Recruit Camp / Leadership Camp (Basic)" },
        { "date": "2026-03-14", "activity": "Recruit Camp / Leadership Camp (Basic)" },
        { "date": "2026-03-15", "activity": "Recruit Camp / Leadership Camp (Basic)" },
        { "date": "2026-03-21", "activity": "No Parade (Hari Raya Puasa)" },
        { "date": "2026-03-28", "activity": "Parade" }
    ],
    "April": [
        { "date": "2026-04-03", "activity": "Good Friday" },
        { "date": "2026-04-04", "activity": "No Parade (HBL Week)" },
        { "date": "2026-04-10", "activity": "BB Blaze Prep Camp (For Selected Boys Only)" },
        { "date": "2026-04-11", "activity": "BB Blaze Competition (For Selected Boys Only) / No Parade" },
        { "date": "2026-04-18", "activity": "Parade" },
        { "date": "2026-04-19", "activity": "BBGB Enrolment Service @ Christalite Methodist Chapel" },
        { "date": "2026-04-25", "activity": "Parade" }
    ],
    "May": [
        { "date": "2026-05-01", "activity": "Labour Day" },
        { "date": "2026-05-02", "activity": "No Parade" },
        { "date": "2026-05-09", "activity": "No Parade" },
        { "date": "2026-05-16", "activity": "Parade" },
        { "date": "2026-05-22", "activity": "Leaders' Training Camp (Sec 2 & 3 Only)" },
        { "date": "2026-05-23", "activity": "Leaders' Training Camp (Sec 2 & 3 Only)" },
        { "date": "2026-05-24", "activity": "Leaders' Training Camp (Sec 2 & 3 Only)" },
        { "date": "2026-05-27", "activity": "Hari Raya Haji" },
        { "date": "2026-05-30", "activity": "No Parade" },
        { "date": "2026-05-31", "activity": "Vesak Day" }
    ],
    "June": [
        { "date": "2026-06-05", "activity": "BB21 Leaders' Retreat 1 (Appointment Holders Only)" },
        { "date": "2026-06-06", "activity": "BB21 Leaders' Retreat 1 (Appointment Holders Only)" },
        { "date": "2026-06-07", "activity": "BB21 Leaders' Retreat 1 (Appointment Holders Only)" },
        { "date": "2026-06-25", "activity": "First Aid Course (Basic) (Sec 2 Only)" },
        { "date": "2026-06-26", "activity": "First Aid Course (Basic) (Sec 2 Only)" }
    ],
    "July": [
        { "date": "2026-07-04", "activity": "Parade" },
        { "date": "2026-07-11", "activity": "Parade / NLAC Camp (Sec 3s Only)" },
        { "date": "2026-07-12", "activity": "NLAC Camp (Sec 3s Only)" },
        { "date": "2026-07-18", "activity": "Parade (BB CARES)" },
        { "date": "2026-07-25", "activity": "Parade" }
    ],
    "August": [
        { "date": "2026-08-01", "activity": "Parade" },
        { "date": "2026-08-08", "activity": "No Parade" },
        { "date": "2026-08-09", "activity": "Labour Day" },
        { "date": "2026-08-15", "activity": "Parade" },
        { "date": "2026-08-22", "activity": "Parade" },
        { "date": "2026-08-28", "activity": "CQ Prep Camp (Selected Boys Only)" },
        { "date": "2026-08-29", "activity": "Character Quest Competition / No Parade (Selected Boys Only)" }
    ],
    "September": [
        { "date": "2026-09-05", "activity": "No Parade (Exam Break)" },
        { "date": "2026-09-12", "activity": "No Parade (Exam Break)" },
        { "date": "2026-09-19", "activity": "No Parade (Exam Break)" },
        { "date": "2026-09-26", "activity": "No Parade (Exam Break)" }
    ],
    "October": [
        { "date": "2026-10-03", "activity": "No Parade (Exam Break)" },
        { "date": "2026-10-10", "activity": "Parade" },
        { "date": "2026-10-17", "activity": "Parade" },
        { "date": "2026-10-24", "activity": "Parade" },
        { "date": "2026-10-30", "activity": "Adventure Camp (Basics & Advanced)" },
        { "date": "2026-10-31", "activity": "Adventure Camp (Basics & Advanced)" }
    ],
    "November": [
        { "date": "2026-11-01", "activity": "Adventure Camp (Basics & Advanced)" },
        { "date": "2026-11-06", "activity": "BB21 Leaders' Retreat 2 (Appointment Holders Only)" },
        { "date": "2026-11-07", "activity": "BB21 Leaders' Retreat 2 (Appointment Holders Only)" },
        { "date": "2026-11-08", "activity": "BB21 Leaders' Retreat 2 (Appointment Holders Only)" },
        { "date": "2026-11-14", "activity": "Parade (Stakeholder Event)" },
        { "date": "2026-11-20", "activity": "Company Camp" },
        { "date": "2026-11-21", "activity": "Company Camp / School Open House" },
        { "date": "2026-11-22", "activity": "Company Camp / Thanksgiving Celebration" }
    ],
    "December": [
        { "date": "2026-12-05", "activity": "HAMPER DELIVERY" },
        { "date": "2026-12-06", "activity": "BBSG Warehouse Duty (One Full Day | Sec 1 & 2 Only)" },
        { "date": "2026-12-09", "activity": "FAA Duty (2 Days Only) (For Selected Sec 3 Only)" },
        { "date": "2026-12-25", "activity": "Christmas Day" }
    ]
}


export default async function HomePage() {
    const session = await getServerSession();

    return (
        <>
            <Header user={session} />
            <Calendar events={calendar} />
            <Footer user={session} />
        </>
    );
}

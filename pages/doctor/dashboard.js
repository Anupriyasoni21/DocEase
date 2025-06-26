import React, { useEffect, useState } from "react";
import styles from "@/styles/dashboard.module.css";
import jwt_decode from "jwt-decode";
import { useRouter } from "next/router";
import { dbLogger } from "@/lib/dbLogger";
import DoctorHeader from "@/components/doctorHeader";




export default function DoctorDashboard() {
  const router = useRouter();
  // const [checkingAuth, setCheckingAuth] = useState(true);
  console.log("[DoctorDashboard] Component mounted");
  

  const [appointments, setAppointments] = useState({ today: [], upcoming: [] });
const [patients, setPatients] = useState([]); // ✅ correct for storing full list

  const [doctorName, setDoctorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("today");
  
  useEffect(() => {
  const token = localStorage.getItem('token');
  // if (!token) {
  //   router.replace('/login');
  //   console.warn("⚠️ No token found, redirecting to login");
  //   return;
  // }
  // console.log("🔑 Token found, decoding...");
  // let decoded;
  // try {
  //   decoded = jwt_decode(token);
  //   if (decoded.role !== 'doctor') {
  //     router.replace('/unauthorized');
  //     console.warn("⚠️ Unauthorized access, redirecting to unauthorized page");
  //     return;
  //   }
  //   setCheckingAuth(false);
  // } catch (err) {
  //   console.log("❌ Error decoding token:", err);
  //   router.replace('/login');
  //   return;
  // }

  // Log dashboard access asynchronously
  const logDashboardAccess = async () => {
    await dbLogger("info", "Doctor Dashboard accessed");
  };
  logDashboardAccess();

  const email = localStorage.getItem("UserEmail");
  if (!email) {
    console.warn("⚠️ No email found in token");
    return;
  }

  const fetchDashboardData = async () => {
    try {
      console.log("🚀 Fetching dashboard data...");

      const res = await fetch("/api/doc/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ send token here

        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      console.log("📬 API response received:", data);
       const logDashboardAccess = async () => {
          await dbLogger("info", "Doctor Dashboard data fetched");
        };
        logDashboardAccess();

      setAppointments({
        today: data.todayAppointments,
        upcoming: data.upcomingAppointments,
      });
setPatients(data.patients); // Now storing the array of patients ✅
      setDoctorName(data.doctorName);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching dashboard data:", err);
          const logDashboardAccess = async () => {
        await dbLogger("info", "Doctor Dashboard data fetch failed", { error: err.message });
      };
      logDashboardAccess();
    }
  };

  fetchDashboardData();
}, []);


  // if (checkingAuth) return <p>Checking authentication...</p>;
  if (loading) {
    console.log("⏳ Waiting for data...");
    return <p>Loading...</p>;
  }

  return (
    <div className={styles.main}>
      <DoctorHeader />
      <div className={styles.dashboardContainer}>
        <header className={styles.header}>
          <h1>Welcome, Dr. {doctorName}</h1>
        </header>

        <section className={styles.statsSection}>
          <div
            className={styles.statCard}
            onClick={() => {
              console.log("🖱️ Switched to section: today");
              setActiveSection("today");
            }}
          >
            <h2>Today's Appointments</h2>
            <p>{appointments.today?.length || 0}</p>
          </div>

          <div
            className={styles.statCard}
            onClick={() => {
              console.log("🖱️ Switched to section: patients");
              setActiveSection("patients");
            }}
          >
            <h2>Total Patients</h2>
              <p>{patients.length}</p> 
            </div>

          <div
            className={styles.statCard}
            onClick={() => {
              console.log("🖱️ Switched to section: upcoming");
              setActiveSection("upcoming");
            }}
          >
            <h2>Upcoming Appointments</h2>
            <p>{appointments.upcoming?.length || 0}</p>
          </div>
        </section>

        <section className={styles.appointmentsSection}>
          <h2>
            {activeSection === "today" && "Today's Appointments Details"}
            {activeSection === "upcoming" && "Upcoming Appointments Details"}
            {activeSection === "patients" && "All Patients List"}
          </h2>

          {/* TODAY */}
          {activeSection === "today" && (
            appointments?.today?.length === 0 ? (
              <p>No appointments for today.</p>
            ) : (
              <ul className={styles.appointmentsList}>
                {appointments?.today?.map((appt) => (
                  <li key={appt._id} className={styles.appointmentItem}>
                    <p><strong>Patient:</strong> {appt.patientId?.name || "Unknown"}</p>
                    <p><strong>Date & Time:</strong> {new Date(`${appt.date} ${appt.time}`).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}</p>
                    <p><strong>Reason:</strong> {appt.reason}</p>
                  </li>
                ))}
              </ul>
            )
          )}

          {/* UPCOMING */}
          {activeSection === "upcoming" && (
            appointments.upcoming.length === 0 ? (
              <p>No upcoming appointments.</p>
            ) : (
              <ul className={styles.appointmentsList}>
                {appointments.upcoming.map((appt) => (
                  <li key={appt._id} className={styles.appointmentItem}>
                    <p><strong>Patient:</strong> {appt.patientId?.name || "Unknown"}</p>
                    <p><strong>Date & Time:</strong> {new Date(`${appt.date} ${appt.time}`).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}</p>
                    <p><strong>Reason:</strong> {appt.reason}</p>
                  </li>
                ))}
              </ul>
            )
          )}

          {/* PATIENT LIST */}
          {activeSection === "patients" && (
            patients.length === 0 ? (
              <p>No patients found.</p>
            ) : (
              <ul className={styles.appointmentsList}>
                {patients.map((patient) => (
                  <li key={patient._id} className={styles.appointmentItem}>
                    <p><strong>Name:</strong> {patient.name}</p>
                    <p><strong>Email:</strong> {patient.email}</p>
                    {/* Add more details if needed */}
                  </li>
                ))}
              </ul>
            )
          )}
        </section>
      </div>
    </div>
  );
}

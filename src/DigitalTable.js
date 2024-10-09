import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DigitalTable.css";

const DigitalTable = () => {
  const activities = [
    "Asegúrate que la estación esté libre de polvo",
    "Limpieza del exterior e interior del equipo",
    "Revisa que el equipo esté encendido",
    "Verificar que las identificaciones de la estación de pruebas no estén dañadas",
    "Retirar de la estación de pruebas los objetos ajenos",
    "Revisa que el equipo cuente con todos los accesorios de acuerdo al MPI",
    "Revisa que la aplicación de prueba esté en modo producción",
    "Revisa que los cables en general estén en buenas condiciones",
  ];

  const usersByTurn = {
    1: ["GDLAAMBR", "GDLESBGA", "GDLISRAC"],
    2: ["GDLJQUEZ", "GDLDOJED", "GDLRCAST"],
    3: ["GDLOLHER", "GDLGAEHE", "GDLARAOR"],
  };

  const [turno, setTurno] = useState("");
  const [realizadoPor, setRealizadoPor] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [comentarios, setComentarios] = useState("");
  const [formValid, setFormValid] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMessageVisible, setErrorMessageVisible] = useState(false);
  const [activitiesStatus, setActivitiesStatus] = useState(
    activities.map(() => "")
  );

  const getCurrentTurno = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 7 && currentHour < 15) return 1;
    if (currentHour >= 15 && currentHour < 23) return 2;
    return 3;
  };

  useEffect(() => {
    const currentTurno = getCurrentTurno();
    setTurno(currentTurno);
    setUsuarios(usersByTurn[currentTurno]);

    const dateInputs = document.querySelectorAll(".fecha");
    const today = new Date().toLocaleDateString();
    dateInputs.forEach((input) => (input.value = today));
  }, []);

  const handleRealizadoPorChange = (e) => {
    setRealizadoPor(e.target.value);
  };

  const handleComentariosChange = (e) => {
    setComentarios(e.target.value);
  };

  const handleActivityStatusChange = (index, status) => {
    const newActivitiesStatus = [...activitiesStatus];
    newActivitiesStatus[index] = status;
    setActivitiesStatus(newActivitiesStatus);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (realizadoPor && activitiesStatus.every((status) => status)) {
      try {
        const clientResponse = await axios.get(
          "http://192.168.206.74:3001/get-client-info"
        );
        const clientInfo = clientResponse.data;
        const formData = {
          turno: `Turno ${turno}`,
          fecha: new Date().toISOString().split("T")[0],
          completado: "Completado",
          realizadoPor: realizadoPor,
          comentarios: comentarios,
          activitiesStatus: activitiesStatus,
          ip_address: clientInfo.ipAddress,
        };

        console.log("Datos enviados:", formData);
        const response = await axios.post(
          "http://192.168.206.74:3001/submit-form",
          formData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Respuesta del servidor:", response.data.message);
        setFormSubmitted(true);
        setTimeout(() => {
          resetForm();
        }, 1500);
      } catch (error) {
        if (error.response) {
          console.error("Error en el servidor:", error.response.data);
        } else if (error.request) {
          console.error("No se recibió respuesta del servidor:", error.request);
        } else {
          console.error("Error al configurar la solicitud:", error.message);
        }
      }
    } else {
      setFormValid(false);
      setErrorMessageVisible(true);

      setTimeout(() => {
        setErrorMessageVisible(false);
      }, 1500);
    }
  };

  const resetForm = () => {
    setRealizadoPor("");
    setComentarios("");
    setFormValid(true);
    setFormSubmitted(false);
    setActivitiesStatus(activities.map(() => ""));
  };

  return (
    <div className="container1">
      <div className="glass">
        <h1>Checklist De Mantenimiento Preventivo Diario</h1>
        <form id="mantenimientoForm" onSubmit={handleSubmit}>
          <table>
            <thead>
              <tr>
                <th>Actividades</th>
                <th>Turno</th>
                <th>Fecha</th>
                <th>Realizado</th>
                <th>No Realizado</th>
                <th>Realizado por</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity, index) => (
                <tr key={index}>
                  <td>{activity}</td>
                  <td>
                    <input
                      type="text"
                      className="turno"
                      value={`Turno ${turno}`}
                      readOnly
                    />
                  </td>
                  <td>
                    <input type="text" className="fecha" readOnly />
                  </td>
                  <td>
                    <input
                      type="radio"
                      name={`actividad${index}`}
                      value="realizado"
                      checked={activitiesStatus[index] === "realizado"}
                      onChange={() =>
                        handleActivityStatusChange(index, "realizado")
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      name={`actividad${index}`}
                      value="noRealizado"
                      checked={activitiesStatus[index] === "noRealizado"}
                      onChange={() =>
                        handleActivityStatusChange(index, "noRealizado")
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="realizado-por"
                      value={realizadoPor}
                      onChange={handleRealizadoPorChange}
                    >
                      <option value="" disabled>
                        Seleccionar
                      </option>
                      {usuarios.map((usuario, index) => (
                        <option key={index} value={usuario}>
                          {usuario}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2>Comentarios</h2>
          <textarea
            placeholder="Escribe tus comentarios aquí"
            id="comentarios"
            value={comentarios}
            onChange={handleComentariosChange}
          ></textarea>
          {!formValid && errorMessageVisible && (
            <p style={{ color: "red" }}>
              Por favor, complete todos los campos.
            </p>
          )}
          {formSubmitted && (
            <p style={{ color: "green" }}>Formulario enviado correctamente.</p>
          )}
          <div className="button-container">
            <button type="submit" className="submit-btn">
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DigitalTable;

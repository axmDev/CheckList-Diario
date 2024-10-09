import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DigitalTable.css";

const DigitalTable = () => {
  const activities = [
    "Asegurate que la estacion este libre de polvo",
    "Limpieza del exterior e interior del equipo",
    "Revisa que el equipo este encendido",
    "Verificar que las identificaciones de la estacion de pruebas no esten dañadas",
    "Retirar de la estacion de pruebas los objetos ajenos",
    "Revisa que el equipo cuente con todos los accesorios de acuerdo al MPI",
    "Revisa que la aplicacion de prueba este en modo produccion",
    "Revisa que los cables en general esten en buenas condiciones",
  ];

  const usersByTurn = {
    1: ["GDLAAMBR", "GDLESBGA", "GDLISRAC", /* otros usuarios */],
    2: ["GDLJQUEZ", "GDLDOJED", "GDLRCAST", /* otros usuarios */],
    3: ["GDLOLHER", "GDLGAEHE", "GDLARAOR", /* otros usuarios */],
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

  // const handleTurnoChange = (e) => {
  //   const selectedTurno = e.target.value;
  //   setTurno(selectedTurno);
  //   setUsuarios(usersByTurn[selectedTurno] || []);
  // };

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

  const getCurrentTurno = () => {
    const currentHour = new Date().getHours();

    if (currentHour >= 7 && currentHour < 15) {
      return "1";
    }
    else if (currentHour >= 15 && currentHour < 23) {
      return "2";
    }
    else {
      return "3";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const turnoActual = getCurrentTurno();


    if (turno && turno === turnoActual && realizadoPor && activitiesStatus.every((status) => status)) {
      try {

        const clientResponse = await axios.get("http://192.168.207.152:3001/get-client-info");
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

        const response = await axios.post("http://192.168.207.152:3001/submit-form", formData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Respuesta del servidor:", response.data.message);
        setFormSubmitted(true);
        setFormValid(true)


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
      }, 1500)
    }
  };

  const resetForm = () => {
    setTurno("");
    setRealizadoPor("");
    setUsuarios([]);
    setComentarios("");
    setFormValid(true);
    setFormSubmitted(false);
    setActivitiesStatus(activities.map(() => ""));
  };

  useEffect(() => {
    const currentTurno = getCurrentTurno();
    setTurno(currentTurno)
    setUsuarios(usersByTurn[currentTurno]);
  }, [])

  useEffect(() => {
    const dateInputs = document.querySelectorAll(".fecha");
    const today = new Date().toLocaleDateString();
    dateInputs.forEach((input) => (input.value = today));
  }, []);

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
                    <input type="text" className="turno" value={`Turno ${turno}`} readOnly />
                    {/* <select className="turno" value={turno} onChange={handleTurnoChange}>
                      <option value="" disabled>Seleccionar</option>
                      <option value="1">Turno 1</option>
                      <option value="2">Turno 2</option>
                      <option value="3">Turno 3</option>
                    </select> */}
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
                      onChange={() => handleActivityStatusChange(index, "realizado")}
                    />
                  </td>
                  <td>
                    <input
                      type="radio"
                      name={`actividad${index}`}
                      value="noRealizado"
                      checked={activitiesStatus[index] === "noRealizado"}
                      onChange={() => handleActivityStatusChange(index, "noRealizado")}
                    />
                  </td>
                  <td>
                    <select className="realizado-por" value={realizadoPor} onChange={handleRealizadoPorChange}>
                      <option value="" disabled>Seleccionar</option>
                      {usuarios.map((usuario, index) => (
                        <option key={index} value={usuario}>{usuario}</option>
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
            <p style={{ color: "red" }}>Por favor, complete todos los campos.</p>
          )}
          {formSubmitted && (
            <p style={{ color: "green" }}>Formulario enviado correctamente.</p>
          )}
          <div className="button-container">
            <button type="submit" className="submit-btn">Enviar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DigitalTable;

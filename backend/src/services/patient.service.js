const oracledb = require('oracledb');
const database = require('../config/database');

// Obtiene los pacientes con paginación y búsqueda
async function getAllPatients(page = 1, limit = 10, search = '') {
  let connection;
  
  try {
    connection = await database.getConnection();
    
    const offset = (page - 1) * limit;
    
    // bind variables
    let query = `
      SELECT 
        ID,
        FIRST_NAME,
        LAST_NAME,
        EMAIL,
        PHONE,
        BIRTH_DATE,
        CREATED_AT,
        UPDATED_AT
      FROM PATIENTS
    `;
    
    let countQuery = 'SELECT COUNT(*) as TOTAL FROM PATIENTS';
    let binds = {};
    
    if (search && search.trim()) {
      const searchCondition = ` WHERE UPPER(FIRST_NAME) LIKE :search OR UPPER(LAST_NAME) LIKE :search`;
      query += searchCondition;
      countQuery += searchCondition;
      binds.search = `%${search.toUpperCase()}%`;
    }
  
    query += ` ORDER BY CREATED_AT DESC OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
    binds.offset = offset;
    binds.limit = limit;
    
    const result = await connection.execute(query, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    
    const countResult = await connection.execute(countQuery, 
      search && search.trim() ? { search: binds.search } : {}, 
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    const total = countResult.rows[0].TOTAL;
    const totalPages = Math.ceil(total / limit);
    
    return {
      patients: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalRecords: total,
        limit: parseInt(limit)
      }
    };
  } catch (error) {
    console.error('ERROR en getAllPatients:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('ERROR cerrando conexion:', err);
      }
    }
  }
}

// Obtener paciente por id
async function getPatientById(id) {
  let connection;
  
  try {
    connection = await database.getConnection();
    
    const query = `
      SELECT 
        ID,
        FIRST_NAME,
        LAST_NAME,
        EMAIL,
        PHONE,
        BIRTH_DATE,
        CREATED_AT,
        UPDATED_AT
      FROM PATIENTS
      WHERE ID = :id
    `;
    
    const result = await connection.execute(
      query,
      { id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error in getPatientById:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

// Verificr si el email ya existe
async function emailExists(connection, email, excludeId = null) {
  try {
    let query = 'SELECT COUNT(*) as COUNT FROM PATIENTS WHERE UPPER(EMAIL) = :email';
    const binds = { email: email.toUpperCase() };
    
    if (excludeId) {
      query += ' AND ID != :excludeId';
      binds.excludeId = excludeId;
    }
    
    const result = await connection.execute(query, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    
    return result.rows[0].COUNT > 0;
  } catch (error) {
    console.error('Error in emailExists:', error);
    throw error;
  }
}


// Crear nuevo paciente
async function createPatient(patientData) {
  let connection;
  
  try {
    connection = await database.getConnection();
    
    // Verificar si el email ya existe usando la misma conexión
    const exists = await emailExists(connection, patientData.email);
    if (exists) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }
    
    const query = `
      INSERT INTO PATIENTS (
        ID,
        FIRST_NAME,
        LAST_NAME,
        EMAIL,
        PHONE,
        BIRTH_DATE
      ) VALUES (
        SEQ_PATIENTS.NEXTVAL,
        :firstName,
        :lastName,
        :email,
        :phone,
        TO_DATE(:birthDate, 'YYYY-MM-DD')
      ) RETURNING ID INTO :id
    `;
    
    const binds = {
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      email: patientData.email,
      phone: patientData.phone,
      birthDate: patientData.birthDate,
      id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };
    
    const result = await connection.execute(query, binds, { autoCommit: false });
    await connection.commit();
    
    const newId = result.outBinds.id[0];
    
    const newPatient = await getPatientById(newId);
    
    return newPatient;
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error('Error rolling back:', rollbackErr);
      }
    }
    console.error('Error in createPatient:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}


// Actualiza un paciente existente
async function updatePatient(id, patientData) {
  let connection;
  
  try {
    connection = await database.getConnection();
    
    // Verificar si el paciente existe
    const existingPatient = await getPatientById(id);
    if (!existingPatient) {
      return null;
    }
    
    // Verificar si el email ya existe excluyendo el id actual
    const emailInUse = await emailExists(connection, patientData.email, id);
    if (emailInUse) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }
    
    const query = `
      UPDATE PATIENTS
      SET 
        FIRST_NAME = :firstName,
        LAST_NAME = :lastName,
        EMAIL = :email,
        PHONE = :phone,
        BIRTH_DATE = TO_DATE(:birthDate, 'YYYY-MM-DD'),
        UPDATED_AT = SYSTIMESTAMP
      WHERE ID = :id
    `;
    
    const binds = {
      id,
      firstName: patientData.firstName,
      lastName: patientData.lastName,
      email: patientData.email,
      phone: patientData.phone,
      birthDate: patientData.birthDate
    };
    
    await connection.execute(query, binds, { autoCommit: false });
    await connection.commit();
    
    const updatedPatient = await getPatientById(id);
    
    return updatedPatient;
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error('Error rolling back:', rollbackErr);
      }
    }
    console.error('Error in updatePatient:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

// Eliminar paciente
async function deletePatient(id) {
  let connection;
  
  try {
    connection = await database.getConnection();
    
    // Verificar si el paciente existe
    const existingPatient = await getPatientById(id);
    if (!existingPatient) {
      return false;
    }
    
    const query = 'DELETE FROM PATIENTS WHERE ID = :id';
    
    await connection.execute(query, { id }, { autoCommit: false });
    await connection.commit();
    
    return true;
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error('Error rolling back:', rollbackErr);
      }
    }
    console.error('Error in deletePatient:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  emailExists
};
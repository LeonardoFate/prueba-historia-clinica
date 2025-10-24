ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI:SS';

-- ============================================
-- DROP objetos existentes
-- ============================================

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE SEQ_PATIENTS';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -2289 THEN
         RAISE;
      END IF;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE PATIENTS CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
/

-- ============================================
-- SEQUENCE
-- ============================================

CREATE SEQUENCE SEQ_PATIENTS
  START WITH 1
  INCREMENT BY 1
  NOCACHE
  NOCYCLE;

-- ============================================
-- CREATE TABLE
-- ============================================

CREATE TABLE PATIENTS (
  ID NUMBER PRIMARY KEY,
  FIRST_NAME VARCHAR2(100) NOT NULL,
  LAST_NAME VARCHAR2(100) NOT NULL,
  EMAIL VARCHAR2(150) NOT NULL,
  PHONE VARCHAR2(20),
  BIRTH_DATE DATE,
  CREATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  UPDATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT UK_PATIENTS_EMAIL UNIQUE (EMAIL),
  CONSTRAINT CHK_EMAIL_FORMAT CHECK (REGEXP_LIKE(EMAIL, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')),
  CONSTRAINT CHK_PHONE_FORMAT CHECK (REGEXP_LIKE(PHONE, '^\d{10}$'))
);

-- ============================================
-- CREATE INDEX
-- ============================================

CREATE INDEX IDX_PATIENTS_FIRST_NAME ON PATIENTS(UPPER(FIRST_NAME));
CREATE INDEX IDX_PATIENTS_LAST_NAME ON PATIENTS(UPPER(LAST_NAME));
CREATE INDEX IDX_PATIENTS_CREATED_AT ON PATIENTS(CREATED_AT DESC);

-- ===============
-- CREATE TRIGGER 
-- ===============

CREATE OR REPLACE TRIGGER TRG_PATIENTS_UPDATED_AT
BEFORE UPDATE ON PATIENTS
FOR EACH ROW
BEGIN
  :NEW.UPDATED_AT := SYSTIMESTAMP;
END;
/

-- ============================================
-- INSERT datos de prueba
-- ============================================

INSERT INTO PATIENTS (
  ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE, BIRTH_DATE
) VALUES (
  SEQ_PATIENTS.NEXTVAL,
  'Juan',
  'Pérez García',
  'juan.perez@email.com',
  '0999999999',
  TO_DATE('1990-01-15', 'YYYY-MM-DD')
);

INSERT INTO PATIENTS (
  ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE, BIRTH_DATE
) VALUES (
  SEQ_PATIENTS.NEXTVAL,
  'María',
  'González López',
  'maria.gonzalez@email.com',
  '0988888888',
  TO_DATE('1985-05-20', 'YYYY-MM-DD')
);

INSERT INTO PATIENTS (
  ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE, BIRTH_DATE
) VALUES (
  SEQ_PATIENTS.NEXTVAL,
  'Carlos',
  'Rodríguez Martínez',
  'carlos.rodriguez@email.com',
  '0977777777',
  TO_DATE('1992-08-10', 'YYYY-MM-DD')
);

INSERT INTO PATIENTS (
  ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE, BIRTH_DATE
) VALUES (
  SEQ_PATIENTS.NEXTVAL,
  'Ana',
  'Martínez Silva',
  'ana.martinez@email.com',
  '0966666666',
  TO_DATE('1988-12-03', 'YYYY-MM-DD')
);

INSERT INTO PATIENTS (
  ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE, BIRTH_DATE
) VALUES (
  SEQ_PATIENTS.NEXTVAL,
  'Luis',
  'Fernández Ruiz',
  'luis.fernandez@email.com',
  '0955555555',
  TO_DATE('1995-03-25', 'YYYY-MM-DD')
);

COMMIT;

-- =================
-- STORED PROCEDURE
-- =================

CREATE OR REPLACE PROCEDURE SP_CREATE_PATIENT (
  p_first_name IN VARCHAR2,
  p_last_name IN VARCHAR2,
  p_email IN VARCHAR2,
  p_phone IN VARCHAR2,
  p_birth_date IN DATE,
  p_patient_id OUT NUMBER,
  p_success OUT NUMBER,
  p_message OUT VARCHAR2
) AS
  v_email_count NUMBER;
  v_phone_valid NUMBER;
  v_email_valid NUMBER;
BEGIN
  -- Validar email único
  SELECT COUNT(*) INTO v_email_count
  FROM PATIENTS
  WHERE UPPER(EMAIL) = UPPER(p_email);
  
  IF v_email_count > 0 THEN
    p_success := 0;
    p_message := 'Email already exists';
    RETURN;
  END IF;
  
  -- Validar formato de email
  SELECT CASE 
    WHEN REGEXP_LIKE(p_email, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') THEN 1
    ELSE 0
  END INTO v_email_valid FROM DUAL;
  
  IF v_email_valid = 0 THEN
    p_success := 0;
    p_message := 'Invalid email format';
    RETURN;
  END IF;
  
  -- Validar formato de teléfono
  SELECT CASE 
    WHEN REGEXP_LIKE(p_phone, '^\d{10}$') THEN 1
    ELSE 0
  END INTO v_phone_valid FROM DUAL;
  
  IF v_phone_valid = 0 THEN
    p_success := 0;
    p_message := 'Phone must be 10 digits';
    RETURN;
  END IF;
  
  -- Validar fecha no futura
  IF p_birth_date > SYSDATE THEN
    p_success := 0;
    p_message := 'Birth date cannot be in the future';
    RETURN;
  END IF;
  
  -- Insertar paciente
  INSERT INTO PATIENTS (
    ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE, BIRTH_DATE
  ) VALUES (
    SEQ_PATIENTS.NEXTVAL,
    p_first_name,
    p_last_name,
    p_email,
    p_phone,
    p_birth_date
  ) RETURNING ID INTO p_patient_id;
  
  COMMIT;
  
  p_success := 1;
  p_message := 'Patient created successfully';
  
EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    p_success := 0;
    p_message := 'Error: ' || SQLERRM;
END;
/
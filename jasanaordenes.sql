-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    area TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS users_pkey ON users(id);

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    folio TEXT UNIQUE NOT NULL,
    cliente_hotel TEXT NOT NULL,
    no_solicitud TEXT NOT NULL,
    no_hoja TEXT,
    modelo TEXT NOT NULL,
    tipo_prenda TEXT NOT NULL,
    color TEXT NOT NULL,
    tela TEXT NOT NULL,
    total_piezas INTEGER NOT NULL,
    current_area TEXT NOT NULL DEFAULT 'corte',
    status TEXT NOT NULL DEFAULT 'active',
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    completed_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS orders_folio_unique ON orders(folio);
CREATE UNIQUE INDEX IF NOT EXISTS orders_pkey ON orders(id);

-- Historial de órdenes
CREATE TABLE IF NOT EXISTS order_history (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    description TEXT NOT NULL,
    from_area TEXT,
    to_area TEXT,
    pieces INTEGER,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS order_history_pkey ON order_history(id);

-- Piezas de la orden
CREATE TABLE IF NOT EXISTS order_pieces (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    area TEXT NOT NULL,
    pieces INTEGER NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS order_pieces_pkey ON order_pieces(id);

-- Transferencias de órdenes
CREATE TABLE IF NOT EXISTS transfers (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    from_area TEXT NOT NULL,
    to_area TEXT NOT NULL,
    pieces INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_by INTEGER NOT NULL,
    processed_by INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    processed_at TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS transfers_pkey ON transfers(id);

-- Notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    transfer_id INTEGER,
    order_id INTEGER,
    reposition_id INTEGER,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS notifications_pkey ON notifications(id);
CREATE INDEX IF NOT EXISTS idx_notifications_reposition_id ON notifications(reposition_id);

-- Tabla de sesión
CREATE TABLE IF NOT EXISTS session (
    sid VARCHAR PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS session_pkey ON session(sid);
CREATE INDEX IF NOT EXISTS idx_session_expire ON session(expire);

-- Tabla de reposiciones
CREATE TABLE IF NOT EXISTS repositions (
    id SERIAL PRIMARY KEY,
    folio TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    solicitante_nombre TEXT NOT NULL,
    solicitante_area TEXT NOT NULL,
    fecha_solicitud TIMESTAMP NOT NULL DEFAULT now(),
    no_solicitud TEXT NOT NULL,
    no_hoja TEXT,
    fecha_corte TEXT,
    causante_dano TEXT NOT NULL,
    tipo_accidente TEXT NOT NULL,
    otro_accidente TEXT,
    descripcion_suceso TEXT NOT NULL,
    modelo_prenda TEXT NOT NULL,
    tela TEXT NOT NULL,
    color TEXT NOT NULL,
    tipo_pieza TEXT NOT NULL,
    consumo_tela REAL,
    urgencia TEXT NOT NULL,
    observaciones TEXT,
    materiales_implicados TEXT,
    volver_hacer TEXT,
    current_area TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendiente',
    created_by INTEGER NOT NULL,
    approved_by INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    approved_at TIMESTAMP,
    completed_at TIMESTAMP,
    rejection_reason TEXT,
    area_causante_dano TEXT,
    CONSTRAINT repositions_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT repositions_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Tabla de tipos de accidente personalizables
CREATE TABLE IF NOT EXISTS accident_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT accident_types_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Insertar usuario administrador predeterminado si no existe
INSERT INTO users (id, username, password, name, area) 
SELECT 1, 'admin', '$2b$10$K7L/8Y3tAl5kzuZVVF8YAOeqMrF6L8yC9xZjKf2vN1qW3sR4t5uV6', 'Administrador', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 1);

-- Insertar tipos de accidente predeterminados
INSERT INTO accident_types (name, description, created_by) VALUES
('Falla de tela', 'Defectos o problemas en el material textil', 1),
('Accidente con máquina', 'Problemas relacionados con el equipo de producción', 1),
('Accidente por operario', 'Errores humanos durante el proceso', 1),
('Actividad mal realizada', 'Proceso ejecutado incorrectamente', 1),
('Defecto en fabricación', 'Problemas durante el proceso de manufactura', 1),
('Error de diseño', 'Problemas en el diseño del producto', 1),
('Problema de calidad', 'Fallos en el control de calidad', 1),
('Otro', 'Otros tipos de accidentes no clasificados', 1)
ON CONFLICT (name) DO NOTHING;

-- Tabla de áreas personalizables
CREATE TABLE IF NOT EXISTS custom_areas (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT custom_areas_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Insertar áreas predeterminadas
INSERT INTO custom_areas (name, display_name, description, created_by) VALUES
('patronaje', 'Patronaje', 'Área de diseño y creación de patrones', 1),
('corte', 'Corte', 'Área de corte de materiales', 1),
('bordado', 'Bordado', 'Área de bordado y decoración', 1),
('ensamble', 'Ensamble', 'Área de ensamble y confección', 1),
('plancha', 'Plancha', 'Área de planchado y acabados', 1),
('calidad', 'Calidad', 'Área de control de calidad', 1),
('operaciones', 'Operaciones', 'Área de operaciones generales', 1),
('admin', 'Administración', 'Área administrativa', 1),
('envios', 'Envíos', 'Área de envíos y distribución', 1),
('almacen', 'Almacén', 'Área de almacenamiento', 1),
('diseño', 'Diseño', 'Área de diseño', 1)
ON CONFLICT (name) DO NOTHING;

-- Historial de reposiciones
CREATE TABLE IF NOT EXISTS reposition_history (
    id SERIAL PRIMARY KEY,
    reposition_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    description TEXT NOT NULL,
    from_area VARCHAR(50),
    to_area VARCHAR(50),
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT reposition_history_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Piezas de reposición
CREATE TABLE IF NOT EXISTS reposition_pieces (
    id SERIAL PRIMARY KEY,
    reposition_id INTEGER NOT NULL,
    talla TEXT NOT NULL,
    cantidad INTEGER NOT NULL,
    folio_original TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Productos adicionales de reposición
CREATE TABLE IF NOT EXISTS reposition_products (
    id SERIAL PRIMARY KEY,
    reposition_id INTEGER NOT NULL,
    modelo_prenda TEXT NOT NULL,
    tela TEXT NOT NULL,
    color TEXT NOT NULL,
    tipo_pieza TEXT NOT NULL,
    consumo_tela REAL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT reposition_products_reposition_id_fkey 
        FOREIGN KEY (reposition_id) REFERENCES repositions(id) ON DELETE CASCADE
);

-- Telas de contraste de reposición
CREATE TABLE IF NOT EXISTS reposition_contrast_fabrics (
    id SERIAL PRIMARY KEY,
    reposition_id INTEGER NOT NULL,
    tela TEXT NOT NULL,
    color TEXT NOT NULL,
    consumo REAL NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT reposition_contrast_fabrics_reposition_id_fkey 
        FOREIGN KEY (reposition_id) REFERENCES repositions(id) ON DELETE CASCADE
);

-- Tiempos de reposición por área
CREATE TABLE IF NOT EXISTS reposition_timers (
    id SERIAL PRIMARY KEY,
    reposition_id INTEGER NOT NULL,
    area TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    elapsed_minutes REAL,
    is_running BOOLEAN DEFAULT false,
    manual_start_time VARCHAR(5), -- HH:MM format
    manual_end_time VARCHAR(5), -- HH:MM format
    manual_date VARCHAR(10), -- YYYY-MM-DD format
    manual_end_date VARCHAR(10),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT reposition_timers_reposition_id_fkey 
        FOREIGN KEY (reposition_id) REFERENCES repositions(id) ON DELETE CASCADE,
    CONSTRAINT reposition_timers_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Transferencias de reposiciones
CREATE TABLE IF NOT EXISTS reposition_transfers (
    id SERIAL PRIMARY KEY,
    reposition_id INTEGER NOT NULL,
    from_area VARCHAR(50) NOT NULL,
    to_area VARCHAR(50) NOT NULL,
    notes TEXT,
    created_by INTEGER NOT NULL,
    processed_by INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    processed_at TIMESTAMP,
    CONSTRAINT reposition_transfers_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT reposition_transfers_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES users(id)
);

-- Contraseñas de administrador
CREATE TABLE IF NOT EXISTS admin_passwords (
    id SERIAL PRIMARY KEY,
    password TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT admin_passwords_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Eventos en la agenda
CREATE TABLE IF NOT EXISTS agenda_events (
    id SERIAL PRIMARY KEY,
    created_by INTEGER NOT NULL,
    assigned_to_area TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date VARCHAR(10) NOT NULL,  -- Formato YYYY-MM-DD
    time VARCHAR(5) NOT NULL,   -- Formato HH:MM
    priority VARCHAR(10) NOT NULL DEFAULT 'media',
    status VARCHAR(15) NOT NULL DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT agenda_events_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabla de materiales de reposición
CREATE TABLE IF NOT EXISTS reposition_materials (
    id SERIAL PRIMARY KEY,
    reposition_id INTEGER NOT NULL,
    material_status TEXT NOT NULL DEFAULT 'disponible',
    missing_materials TEXT,
    notes TEXT,
    is_paused BOOLEAN NOT NULL DEFAULT false,
    pause_reason TEXT,
    paused_by INTEGER,
    paused_at TIMESTAMP,
    resumed_by INTEGER,
    resumed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT reposition_materials_reposition_id_fkey 
        FOREIGN KEY (reposition_id) REFERENCES repositions(id) ON DELETE CASCADE,
    CONSTRAINT reposition_materials_paused_by_fkey 
        FOREIGN KEY (paused_by) REFERENCES users(id),
    CONSTRAINT reposition_materials_resumed_by_fkey 
        FOREIGN KEY (resumed_by) REFERENCES users(id)
);

-- Tabla de documentos para pedidos y reposiciones
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    order_id INTEGER,
    reposition_id INTEGER,
    uploaded_by INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT documents_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT documents_reposition_id_fkey 
        FOREIGN KEY (reposition_id) REFERENCES repositions(id) ON DELETE CASCADE,
    CONSTRAINT documents_uploaded_by_fkey 
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
);
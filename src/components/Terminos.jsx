import React from 'react';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

export default function Terminos({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 text-white rounded-2xl max-w-3xl w-full mx-4 p-6 overflow-y-auto max-h-[90vh] relative"
        onClick={e => e.stopPropagation()}
      >
        <IconButton
   size="small"
   onClick={onClose}
   sx={{ position: 'absolute', top: 16, right: 16, color: 'white' }}
   aria-label="Cerrar"
 >
   <Close />
 </IconButton>

        <h1 className="text-3xl font-bold text-center mb-4">Términos y Condiciones</h1>

        <section className="space-y-2 mb-4">
          <h2 className="text-2xl font-semibold">1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar el sitio web Cachondo MX (en adelante, el "Sitio"), usted acepta cumplir estos Términos y Condiciones.
            Si no está de acuerdo con alguno de los términos, por favor no utilice el Sitio.
          </p>
        </section>

        <section className="space-y-2 mb-4">
          <h2 className="text-2xl font-semibold">2. Elegibilidad</h2>
          <p>
            El uso de Cachondo MX está restringido a personas mayores de edad según la legislación vigente en su jurisdicción,
            con plena capacidad legal para contratar. El registro de cuentas falsas o información incompleta o incorrecta está prohibido.
          </p>
        </section>

        <section className="space-y-2 mb-4">
          <h2 className="text-2xl font-semibold">3. Protección de Datos Personales</h2>
          <p>
            En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares de México,
            Cachondo MX adopta las medidas necesarias para salvaguardar la información personal de sus usuarios.
            Los datos recabados se utilizan únicamente para la prestación de servicios y no se compartirán con terceros
            sin el consentimiento expreso del titular, salvo excepciones previstas por la ley.
          </p>
          <p>
            Usted tiene derecho a ejercer los derechos de acceso, rectificación, cancelación y oposición (ARCO), así como
            otros derechos que la ley le confiere. Para ello, puede enviar una solicitud al correo: privacidad@cachondomx.com.
          </p>
        </section>

        <section className="space-y-2 mb-4">
          <h2 className="text-2xl font-semibold">4. Cuenta de Usuario</h2>
          <ul className="list-disc list-inside">
            <li>Debe proporcionar datos veraces al registrarse.</li>
            <li>Es responsable de mantener la confidencialidad de su contraseña y cuenta.</li>
            <li>Notifique de inmediato cualquier uso no autorizado de su cuenta.</li>
          </ul>
        </section>

        <section className="space-y-2 mb-4">
          <h2 className="text-2xl font-semibold">5. Depósitos y Retiros</h2>
          <p>
            Las transacciones monetarias se realizarán mediante los métodos de pago disponibles. Cachondo MX no se hace responsable
            por comisiones aplicadas por terceros.
          </p>
        </section>

        <section className="space-y-2 mb-4">
          <h2 className="text-2xl font-semibold">6. Juego Responsable</h2>
          <p>
            Promovemos el juego responsable. Si cree tener un problema con el juego, por favor busque ayuda profesional o establezca límites
            en su cuenta.
          </p>
        </section>

        <section className="space-y-2 mb-4">
          <h2 className="text-2xl font-semibold">7. Exención de Responsabilidad</h2>
          <p>
            Cachondo MX no garantiza resultados ni asume responsabilidad por pérdidas derivadas de la participación en juegos de azar.
          </p>
        </section>

        <section className="space-y-2 mb-4">
          <h2 className="text-2xl font-semibold">8. Modificaciones de los Términos</h2>
          <p>
            Nos reservamos el derecho de modificar estos Términos en cualquier momento. Las actualizaciones se publicarán en el Sitio
            con la fecha de entrada en vigor.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-2xl font-semibold">9. Legislación Aplicable y Jurisdicción</h2>
          <p>
            Estos Términos se regirán por las leyes de México. Cualquier disputa se someterá a los tribunales competentes de la Ciudad de México.
          </p>
        </section>

      </div>
    </div>
  );
}

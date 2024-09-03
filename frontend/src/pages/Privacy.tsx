export default function Privacy():React.ReactElement{
    return(
        <div className="flex flex-col gap-4 max-w-screen-md mt-8">
            <h1 className="text-3xl">Política de Privacidad</h1>
            <p>
                Pues no hay mucho que contar, solo voy a almacenar en la base de datos tu id de discord y las cosas que has votado en cada categoría.
            </p>
            <p>
                De discord los únicos datos que recibo son cosas públicas: el nombre de usuario, el id de tu avatar, el color de tu perfil... lo puedes comprobar viendo las peticiones que hace la página con el inspector de elementos.
            </p>
        </div>
    );
}
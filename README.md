# EcoVida

### Aplicación móvil para fomentar hábitos sostenibles y el cuidado del medioambiente

EcoVida es una aplicación móvil desarrollada para promover prácticas
responsables con el medioambiente mediante el registro de actividades
ecológicas, el establecimiento de metas y el seguimiento del impacto
ambiental.

El proyecto utiliza tecnologías web y Apache Cordova para generar una
aplicación compatible con dispositivos Android.

------------------------------------------------------------------------

## Características principales

-   **Registro e inicio de sesión:** permite crear perfiles y acceder
    mediante correo electrónico y contraseña.
-   **Perfiles independientes:** cada usuario mantiene sus propias
    actividades, metas, puntos y datos.
-   **Actividades ecológicas:** permite registrar acciones relacionadas
    con:
    -   Reciclaje.
    -   Transporte sostenible.
    -   Ahorro de agua.
    -   Ahorro de electricidad.
    -   Reutilización.
    -   Reducción del uso de plásticos.
-   **Gestión de metas:** permite crear objetivos y consultar su
    progreso.
-   **Impacto ambiental:** presenta indicadores asociados a las
    actividades registradas.
-   **Logros y reconocimientos:** incorpora puntos y reconocimientos
    para incentivar la participación.
-   **Historial:** permite consultar las actividades registradas.
-   **Contenido educativo:** ofrece consejos y recursos sobre prácticas
    sostenibles.

## Tecnologías utilizadas

  -----------------------------------------------------------------------
  Tecnología                          Utilización
  ----------------------------------- -----------------------------------
  HTML5                               Estructura de la aplicación.

  CSS3                                Diseño y estilos de la interfaz.

  JavaScript                          Lógica y funcionalidades.

  Apache Cordova 13.0.0               Integración y compilación móvil.

  Cordova Android 15.1.0              Plataforma Android.

  localStorage                        Almacenamiento local de
                                      información.

  Node.js 22                          Entorno de ejecución para las
                                      herramientas de desarrollo.

  Git y GitHub                        Control de versiones y alojamiento
                                      del código.

  GitHub Actions                      Automatización del proceso de
                                      compilación.
  -----------------------------------------------------------------------

## Requisitos para el desarrollo

Para preparar y compilar el proyecto se requiere:

-   Node.js 22.
-   Apache Cordova CLI 13.0.0.
-   Java JDK 17.
-   Android SDK y herramientas de compilación compatibles con la
    plataforma Android utilizada.

## Instalación y ejecución

### 1. Clonar el repositorio

``` bash
git clone https://github.com/Kratoslegend/EcoVida.git
```

### 2. Ingresar al directorio

``` bash
cd EcoVida
```

### 3. Instalar Apache Cordova CLI

Si todavía no está instalado:

``` bash
npm install -g cordova@13.0.0
```

### 4. Preparar la plataforma Android

Si la plataforma Android todavía no está agregada al proyecto:

``` bash
cordova platform add android@15.1.0
```

### 5. Compilar la aplicación

Para generar una versión de depuración:

``` bash
cordova build android --debug
```

Al finalizar correctamente la compilación, el APK se genera en:

``` text
platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

## Generación automatizada del APK

El proyecto incorpora un flujo de trabajo mediante **GitHub Actions**,
configurado en:

``` text
.github/workflows/android-build.yml
```

Este flujo automatiza la compilación de la aplicación para Android y
permite obtener el archivo APK como artefacto descargable desde la
sección **Actions** del repositorio.

Para descargarlo:

1.  Ingresar al repositorio de EcoVida.
2.  Seleccionar la sección **Actions**.
3.  Abrir una ejecución exitosa del flujo de compilación.
4.  Descargar el artefacto `EcoVida-Android-APK`.

## Almacenamiento y gestión de usuarios

EcoVida utiliza `localStorage` para conservar la información en el
dispositivo. Cada perfil dispone de un espacio de almacenamiento
independiente, lo que permite mantener separados sus registros, metas y
puntuaciones.

Las contraseñas se procesan mediante PBKDF2 con SHA-256 y un salt
individual.

**Consideraciones:**

-   Los datos se almacenan localmente en el dispositivo.
-   No existe sincronización de información entre distintos
    dispositivos.
-   El registro mediante correo electrónico corresponde a una gestión
    local de perfiles; no utiliza autenticación mediante un servidor
    externo.
-   La recuperación de contraseñas mediante correo electrónico no está
    implementada.

## Repositorio

El código fuente del proyecto se encuentra disponible públicamente en
GitHub:

**https://github.com/Kratoslegend/EcoVida**

## Autoría

**Proyecto:** EcoVida\
**Área:** Desarrollo de aplicaciones móviles\
**Plataforma:** Android\
**Tecnologías principales:** HTML5, CSS3, JavaScript y Apache Cordova\
**Repositorio:** https://github.com/Kratoslegend/EcoVida

------------------------------------------------------------------------

*EcoVida: pequeñas acciones, grandes cambios para nuestro planeta.*

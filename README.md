# LiveShopping
php -S localhost:8000 -t public


php bin/console make:migration
php bin/console doctrine:migrations:migrate

composer require symfony/security-bundle
composer require symfony/form symfony/validator
php bin/console make:form InscriptionForm 
php bin/console make:controller InscriptionController 
composer require symfony/http-client
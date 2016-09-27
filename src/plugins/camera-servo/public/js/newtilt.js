(function(window) 
{
    'use strict';
    class CameraServo 
    {
        constructor( cockpit )
        {
            console.log('CameraServo Plugin running');

            var self = this;
            self.cockpit = cockpit;

            self.settings = null;   // These get sent by the local model

            self.currentPos = 0.0;  // As reported by the local model
            self.targetPos = 0.0;   // As requested by this plugin

            self.currentStep = 0;   // Alternative representation of targetPos
            self.stepMap = {};      // Automatically generated mapping of integer "steps" to target positions

            // Setup input handlers
            this.inputDefaults = [{
                name: 'plugin.cameraServo.stepNegative',
                description: 'Point the camera further down.',
                defaults: 
                {
                    keyboard: 'z',
                    gamepad: 'A'
                },
                down: function() 
                {
                    cockpit.rov.emit( 'plugin.cameraServo.stepNegative' );
                }
            }, 
            {
                name: 'plugin.cameraServo.stepCenter',
                description: 'Return camera to center position',
                defaults: 
                {
                    keyboard: 'a',
                    gamepad: 'B'
                },
                down: function() 
                {
                    cockpit.rov.emit( 'plugin.cameraServo.center' );
                }
            }, 
            {
                name: 'plugin.cameraServo.stepPositive',
                description: 'Point the camera further up.',
                defaults: 
                {
                    keyboard: 'q',
                    gamepad: 'Y'
                },
                down: function()
                {
                    cockpit.rov.emit( 'plugin.cameraServo.stepPositive' );
                }
            }];
        };

        generateStepMap()
        {
            var self = this;

            // Clear previous map
            self.stepMap = {};

            // Set the center position
            self.stepMap[ 0 ] = 0.0;

            // Split positive and negative ranges into discrete steps, with a special step of 0 assigned to 0.0 position
            if( self.settings.rangeMax > 0 )
            {
                var steps = Math.ceil( self.settings.rangeMax / self.settings.stepResolution );

                // Set the final step to be the max range
                self.stepMap[ steps ] = self.settings.rangeMax;

                // Loop through the remaining steps (if any) and map them to positions
                for( i = 1; i < steps; i++ )
                {
                    self.stepMap[ i ] = i * self.settings.stepResolution;
                }
            }

            if( self.settings.rangeMin < 0 )
            {
                var steps = Math.ceil( Math.abs( self.settings.rangeMin ) / self.settings.stepResolution );

                // Set the final step to be the max range
                self.stepMap[ -steps ] = self.settings.rangeMin;

                // Loop through the remaining steps (if any) and map them to positions
                for( i = 1; i < steps; i++ )
                {
                    self.stepMap[ -i ] = -i * self.settings.stepResolution;
                }
            }
        }

        calculateStepFromPos()
        {
            var self = this;

            // Transforms the current position angle into a discrete step, truncating partial steps to the closest previous step
            if( self.currentPos > 0 )
            {
                if( self.currentPos < self.settings.rangeMax )
                {
                    self.currentStep = Math.floor( self.currentPos / self.settings.stepResolution )
                }
                else
                {
                    self.currentStep = self.stepMap.max;
                }
            }
            else if( self.currentPos < 0 )
            {
                if( self.currentPos > self.settings.rangeMin )
                {
                    self.currentStep = -Math.floor( Math.abs( self.currentPos ) / self.settings.stepResolution )
                }
                else
                {
                    self.currentStep = self.stepMap.min;
                }
            }
            else
            {
                self.currentStep = 0;
            }

            // Handle cases where currentStep is calculated as -0
            if( Object.is( -0, self.currentStep ) )
            {
                self.currentStep = 0;
            }
        }

        updatePosition()
        {
            // Calculate the currentStep

            // Send request to local model
            cockpit.rov.emit( 'plugin.cameraServo.setTargetPos', this.targetPos );
        }

        updateStep()
        {
            // Update targetPos based on currentStep
            this.targetPos = this.stepMap[ self.currentStep ];

            // Send request to local model
            cockpit.rov.emit( 'plugin.cameraServo.setTargetPos', this.targetPos );
        }

        stepPositive()
        {
            // Increment step position
            this.

            // Update position based on new step
            this.updatePosition();
        }

        stepNegative()
        {
            // Decrement step position

            // Update position based on new step
            this.updatePosition();
        }

        max()
        {
            // Set step position to max positive step

            // Update position based on new step
            this.updatePosition();
        }

        center()
        {
            // Set step position to 0

            // Update position based on new step
            this.updatePosition();
        }

        min()
        {
            // Set step position to max negative step

            // Update position based on new step
            this.updatePosition();
        }

        updatePosition()
        {
            // Calculate new position based on steps

            // Issue new target position to local model
        }

        getTelemetryDefinitions()
        {
            return [
            {
                name: 'cameraServo.currentPos',
                description: 'Actual camera servo position reported in degrees'
            },
            {
                name: 'cameraServo.targetPos',
                description: 'Requested camera servo position reported in degrees'
            }
        };

        // This pattern will hook events in the cockpit and pull them all back
        // so that the reference to this instance is available for further processing
        listen() 
        {
            var self = this;

            // Listen for settings from the local model
            this.cockpit.rov.withHistory.on('plugin.cameraServo.settingsChange', function(settings)
            {
                // Copy settings
                self.settings = settings;

                // Generate the step map
                self.generateStepMap();
            });

            // Local Model currentPos
            this.cockpit.rov.withHistory.on('plugin.cameraServo.currentPos', function( position )
            {
                self.cockpit.emit( 'plugin.cameraServo.currentPos', position );
            });

            // Local Model targetPos
            this.cockpit.rov.withHistory.on('plugin.cameraServo.targetPos', function( position )
            {
                self.cockpit.emit( 'plugin.cameraServo.targetPos', position );
            });

            // API functions

            // StepPositive
            // StepNegative
            // Center
            // Min
            // Max
            // 
        };
    };

    // Add plugin to the window object and add it to the plugins list
    var plugins = namespace('plugins');
    plugins.CameraTilt = CameraTilt;
    window.Cockpit.plugins.push( plugins.CameraTilt );

}(window));
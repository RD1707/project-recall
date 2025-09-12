import React from 'react';
import Joyride, { EVENTS, STATUS } from 'react-joyride';

const OnboardingTour = ({ onComplete }) => {
    const steps = [
        {
            target: '.content-header h2',
            content: 'Bem-vindo ao Recall! Esta é a sua área de baralhos, onde tudo começa.',
            placement: 'bottom',
            disableBeacon: true,
        },
        {
            target: '#create-deck-btn',
            content: 'Para começar, que tal criar seu primeiro baralho? Você pode clicar aqui ou no card pontilhado.',
            placement: 'right',
        },
        {
            target: '#deck-search',
            content: 'Quando tiver muitos baralhos, use este campo para buscar facilmente o que precisa.',
            placement: 'bottom',
        },
        {
            target: '#user-menu-button',
            content: 'Aqui você pode acessar seu perfil, ver suas pontuações, ir para as configurações e sair da sua conta.',
            placement: 'bottom-end',
        },
        {
            target: 'a[href="/progress"]',
            content: 'Acompanhe todo o seu progresso de estudos e suas conquistas nesta página. Bom aprendizado!',
            placement: 'bottom',
        }
    ];

    const handleJoyrideCallback = (data) => {
        const { status } = data;

        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            onComplete(); 
        }
    };

    return (
        <Joyride
            steps={steps}
            run={true}
            continuous={true}
            showProgress={true}
            showSkipButton={true}
            callback={handleJoyrideCallback}
            locale={{
                back: 'Voltar',
                close: 'Fechar',
                last: 'Fim',
                next: 'Próximo',
                skip: 'Pular',
            }}
            styles={{
                options: {
                    arrowColor: '#ffffff',
                    backgroundColor: '#ffffff',
                    primaryColor: '#4f46e5',
                    textColor: '#374151',
                    zIndex: 10000,
                },
            }}
        />
    );
};

export default OnboardingTour;
import './StatBlock.css'

function StatBlock() {

    return (
        <>
        <div className='statblock'>
            <div className='statcard'>
                <h2>
                People are much more likely to maintain physical activity when they exercise with a companion.
                </h2>
                <p>
                study found that adults who exercised with a friend were <strong>32% more likely to get enough physical activity and 45% more likely to report good mental health than those exercising alone</strong>, highlighting the benefit of social accountability for both fitness and well-being.
                </p>
                <p id="source">
                    -National Institutes of Health
                </p>
            </div>
            <div className='statcard'>
                <h2>
                Lack of motivation is a common barrier to physical activity.
                </h2>
                <p>
                In a large study during the COVID-19 pandemic, about<strong> 31% of adults reported a lack of motivation as a key reason for decreased physical activity </strong>, showing how motivation is crucial for consistent workouts.
                </p>
                <p id='source'>
                    -National Library of Medicine
                </p>
            </div>
            <div className='statcard'>
                <h2>
                Most adults do not meet recommended exercise guidelines.
                </h2>
                <p>
                According to the U.S. Centers for Disease Control and Prevention (CDC), only about <strong>24% of adults meet both the aerobic and muscle-strengthening physical activity guidelines</strong>, meaning the vast majority fall short of maintaining well-rounded, consistent fitness routines. This gap highlights how difficult it is for people to sustain regular exercise habits without structure, motivation, or accountability, reinforcing the need for platforms that help individuals stay committed through social support.
                </p>
                <p id='source'>
                    -National Center for Health and Statistics
                </p>
            </div>
        </div>
        </>
    );

}
 



export default StatBlock
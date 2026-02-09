import { Link } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';

const MAJOR_CITIES = [
    { name: 'Delhi', state: 'Delhi', icon: '🏛️', issues: 234, highlighted: true },
    { name: 'Mumbai', state: 'Maharashtra', icon: '🌆', issues: 198, highlighted: true },
    { name: 'Kolkata', state: 'West Bengal', icon: '🌉', issues: 156, highlighted: false },
    { name: 'Chennai', state: 'Tamil Nadu', icon: '🏖️', issues: 143, highlighted: false },
    { name: 'Bangalore', state: 'Karnataka', icon: '💻', issues: 189, highlighted: true },
    { name: 'Hyderabad', state: 'Telangana', icon: '🏰', issues: 167, highlighted: false },
    { name: 'Ahmedabad', state: 'Gujarat', icon: '🏭', issues: 98, highlighted: false },
    { name: 'Pune', state: 'Maharashtra', icon: '📚', issues: 112, highlighted: false },
    { name: 'Jaipur', state: 'Rajasthan', icon: '🏯', issues: 87, highlighted: true },
    { name: 'Lucknow', state: 'Uttar Pradesh', icon: '🕌', issues: 134, highlighted: true },
    { name: 'Chandigarh', state: 'Punjab', icon: '🌳', issues: 56, highlighted: false },
    { name: 'Bhopal', state: 'Madhya Pradesh', icon: '🌿', issues: 78, highlighted: false },
    { name: 'Patna', state: 'Bihar', icon: '🛕', issues: 92, highlighted: true },
    { name: 'Guwahati', state: 'Assam', icon: '🌊', issues: 45, highlighted: false },
    { name: 'Kochi', state: 'Kerala', icon: '⛵', issues: 67, highlighted: false }
];

const CitiesScroll = () => {
    // Duplicate cities array for seamless infinite scroll
    const cities = [...MAJOR_CITIES, ...MAJOR_CITIES];

    return (
        <section className="cities-section">
            <div className="cities-scroll">
                {cities.map((city, index) => (
                    <Link
                        key={`${city.name}-${index}`}
                        to={`/issues?state=${encodeURIComponent(city.state)}`}
                        style={{ textDecoration: 'none' }}
                    >
                        <div className={`city-card ${city.highlighted ? 'highlighted' : ''}`}>
                            <span className="city-icon">{city.icon}</span>
                            <div className="city-info">
                                <h4>{city.name}</h4>
                                <p>{city.state}</p>
                            </div>
                            {city.highlighted && (
                                <span className="city-count">{city.issues}+</span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default CitiesScroll;
